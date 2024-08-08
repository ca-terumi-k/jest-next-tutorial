export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages';
import { storage, store } from '@/lib/firebase/admin';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import logger from '@/app/logger';
import NodeCache from 'node-cache';
// import pdf from 'pdf-parse';

const cache = new NodeCache({ stdTTL: 3600 }); // 1時間のTTL

let globalModel: ChatOpenAI | null = null;

function getOrCreateModel(userSettings: UserSettings): ChatOpenAI {
    if (!globalModel) {
        globalModel = new ChatOpenAI({
            temperature: userSettings.temperature || 0.3,
            model: userSettings.model || 'gpt-3.5-turbo',
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return globalModel;
}

class ApiError extends Error {
    status: number;
    constructor(message: string, status: number = 500) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// エラーログ用の関数
function logError(error: unknown): void {
    if (error instanceof Error) {
        logger.error('Error in POST request:', error);
        logger.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } else {
        logger.error('Unknown error occurred:', error);
    }
}

async function getUserSettings(uid: string) {
    const userDoc = await store.collection('users').doc(uid).get();
    if (!userDoc.exists) {
        throw new Error('User not found');
    }
    return userDoc.data() as UserSettings;
}

interface UserSettings {
    promptTemplate: string;
    model: string;
    temperature: number;
}

const DEFAULT_TEMPLATE = `
以下の内容を包括的に要約し、構造化された形式で提示してください:
{content}
要約は以下の条件と指示に厳密に従ってください：

言語と文字数:
全体の文字数は1000〜1200文字の範囲内に収めること

構造とフォーマット:
以下のテンプレートに厳密に従って出力すること
見やすさのため、適切な改行とインデントを使用すること
各セクションは簡潔かつ情報量の多い内容にすること

内容の要素:

主題: 文書全体の中心的なテーマや論点を簡潔に述べる（30字以内）
キーワード: 文書の重要な概念や用語を5つ列挙する
全体の要約: 文書の主要なポイントと結論を簡潔に要約する（150字以内）
セクションごとの要約: 各章または主要セクションの要点を箇条書きで示す


追加の指示:

各章またはセクションには、その内容を最もよく表す短いタイトルをつけること
重要な統計、数字、引用がある場合は、それらを含めること
文書の論理的な流れや議論の展開を反映させること
著者の主張や結論を明確に示すこと


テンプレート:


主題: [30字以内で記述]
キーワード: [5つのキーワードをカンマ区切りで列挙]
全体の要約: [150字以内で記述]
セクションごとの要約:

[章番号]. [章のタイトル]:
• [重要ポイント1]
• [重要ポイント2]
• [重要ポイント3]（必要に応じて追加）
[章番号]. [章のタイトル]:
• [重要ポイント1]
• [重要ポイント2]
• [重要ポイント3]（必要に応じて追加）

...（必要に応じて章を追加）
結論: [著者の最終的な主張や結論を50字以内で要約]

追加情報:

文書に複数の章や大きなセクションがある場合は、上記テンプレートに従って各章を追加してください。
内容が膨大で1200字を超える場合は、最も重要な情報に焦点を当てて要約し、必要に応じて続編を作成してください。続編を作成する場合は、「続編」と明記し、同じテンプレートに従って作成してください。
`;

// const DEFAULT_SUMMARY_TEMPLATE = `
// 以下の複数の要約を分析し、包括的な単一の要約にまとめてください:
// {summaries}
// 最終的な要約は以下の条件と指示に厳密に従ってください：

// 言語と文字数:
// 言語指定は最初の要約に従うこと
// 全体の文字数は1800〜2000文字の範囲内に収めること


// 構造とフォーマット:

// 以下のテンプレートに厳密に従って出力すること
// 見やすさのため、適切な改行とインデントを使用すること
// 各セクションは簡潔かつ情報量の多い内容にすること


// 内容の要素:

// 主題: 全ての要約を網羅する中心的なテーマや論点を簡潔に述べる（40字以内）
// キーワード: 全ての要約から抽出した重要な概念や用語を5つ改行して箇条書きで示す
// 全体の要約: 全ての要約の主要なポイントと結論を簡潔にまとめる（200字以内）
// 主要なポイント: 全ての要約から抽出した最も重要な論点や発見を箇条書きで示す（5〜7点）
// 相違点と共通点: 要約間の主要な相違点と共通点を明確に示す
// 結論と示唆: 全ての要約から導き出される総合的な結論や示唆を述べる


// 追加の指示:

// 各要約の重要性を考慮し、バランスの取れた統合を行うこと
// 重要な統計、数字、引用がある場合は、それらを含めること
// 論理的な流れや議論の展開を反映させること
// 矛盾する情報がある場合は、その点を明確に指摘すること
// 要約間のつながりや関連性を示すこと
// MarkDown形式を使用し、
// 出力用に整形されたテキストを提出することコードブロックでは囲わないでください
// 最大でh2タグ(##)になるように見出しを設定すること
// 見出しも見やすく考えてください
// 長文になる場合は適度に改行を入れてください


// テンプレート:


// 主題: [40字以内で記述]
// キーワード: [7つのキーワードをカンマ区切りで列挙]
// 全体の要約: [200字以内で記述]
// 主要なポイント:

// [重要ポイント1の簡潔な説明]
// [重要ポイント2の簡潔な説明]
// [重要ポイント3の簡潔な説明]
// [重要ポイント4の簡潔な説明]
// [重要ポイント5の簡潔な説明]
// (必要に応じて6と7を追加)

// 相違点と共通点:

// 相違点:

// [主要な相違点1]
// [主要な相違点2]
// [主要な相違点3]


// 共通点:

// [主要な共通点1]
// [主要な共通点2]
// [主要な共通点3]



// 結論と示唆:
// [全ての要約から導き出される総合的な結論や示唆を100字以内で記述]`;

const DEFAULT_SUMMARY_TEMPLATE = `{summaries}をまとめてMarkDown形式を使用し、出力用に整形されたテキストを提出することコードブロックでは囲わないでください`;

async function getFileFromStorage(uid: string, fileName: string): Promise<string> {
    const bucket = storage.bucket();
    const file = bucket.file(`uploads/${uid}/${fileName}`);
    try {
        const [fileContent] = await file.download();

        // PDFファイルのロック状態を確認
        // const pdfData = await pdf(fileContent);
        // if (pdfData.info && pdfData.info.Encrypted) {
        //     throw new ApiError('PDFファイルがパスワードで保護されています', 403);
        // }

        const blob = new Blob([fileContent], { type: 'application/pdf' });
        const loader = new PDFLoader(blob);
        const docs = await loader.load();
        return docs.map((doc) => doc.pageContent).join('\n');
    } catch (error) {
        console.error('Error processing file:', error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('ファイルの処理中にエラーが発生しました', 500);
    }
}

async function combineSummaries(
    summaries: string[],
    model: ChatOpenAI,
    template: string
): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(model);

    const result = await chain.invoke({ summaries: summaries.join('\n\n') });
    return (result as BaseMessage).content as string;
}

async function optimizedParallelProcessing(content: string, userSettings: UserSettings) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 8000,
        chunkOverlap: 200,
    });

    const docs = await textSplitter.createDocuments([content]);

    const model = new ChatOpenAI({
        temperature: userSettings.temperature || 0,
        model: userSettings.model || 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate(userSettings.promptTemplate || DEFAULT_TEMPLATE);

    const chain = prompt.pipe(model);
    // バッチサイズを定義
    const BATCH_SIZE = 5;

    // ドキュメントを処理するための非同期ジェネレータ関数
    async function* processDocuments() {
        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            const batch = docs.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (doc) => {
                const cacheKey = `${doc.pageContent}-${userSettings.temperature}-${userSettings.model}`;
                const cachedResult = cache.get(cacheKey);
                if (cachedResult) {
                    return cachedResult as string;
                }
                const result = await chain.invoke({ content: doc.pageContent });
                const text = result.content as string;
                cache.set(cacheKey, text);
                return text;
            });
            yield await Promise.all(batchPromises);
        }
    }

    const results: string[] = [];
    for await (const batchResults of processDocuments()) {
        results.push(...batchResults);
    }

    return results;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, fileName } = body;

        if (!uid || !fileName) {
            return NextResponse.json({ error: 'UIDとファイル名が必要です' }, { status: 400 });
        }

        const [userSettings, fileContent] = await Promise.all([
            getUserSettings(uid),
            getFileFromStorage(uid, fileName),
        ]);

        const summaries = await optimizedParallelProcessing(fileContent, userSettings);

        const model = getOrCreateModel(userSettings);
        const finalSummary = await combineSummaries(summaries, model, DEFAULT_SUMMARY_TEMPLATE);

        return NextResponse.json({ summary: finalSummary });
    } catch (error) {
        logError(error);
        return handleError(error);
    }
}

function handleError(error: unknown) {
    if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    } else if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message || '不明なエラーが発生しました' },
            { status: 500 }
        );
    } else {
        return NextResponse.json({ error: '不明なエラーが発生しました' }, { status: 500 });
    }
}
