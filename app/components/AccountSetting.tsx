import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserSettings {
    promptTemplate: string;
    model: string;
    temperature: number;
}

const DEFAULT_SETTINGS: UserSettings = {
    promptTemplate: `以下の内容を包括的に要約し、構造化された形式で提示してください:
    {content}
    要約は以下の条件と指示に厳密に従ってください：

    言語と文字数:

    日本語で回答すること
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


    品質チェック:

    要約が完成したら、原文の主要なポイントが漏れなく含まれているか確認してください。
    誤解を招く可能性のある表現や不正確な情報がないか確認してください。
    全体の文字数が指定範囲内に収まっているか確認してください。



    この指示に従って、与えられた文書の包括的かつ構造化された要約を作成してください。`,
    model: 'gpt-4o',
    temperature: 0,
};

const AccountSettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            if (user) {
                setIsLoading(true);
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Partial<UserSettings>;
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        ...data,
                    });
                } else {
                    setSettings(DEFAULT_SETTINGS);
                }
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        if (!settings) return;
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev!,
            [name]:
                name === 'temperature' ? Math.max(0, Math.min(1, parseFloat(value) || 0)) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSaving(true);
        setError('');
        try {
            if (user) {
                await setDoc(doc(db, 'users', user.uid), settings);
                onClose();
            }
        } catch (err) {
            setError('設定の保存に失敗しました。');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const setDefaultSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="bg-white rounded-lg p-6 w-4/5 max-h-[90vh] max-h-[90vh] overflow-y-auto mx-auto">
                <h2 className="text-2xl font-bold mb-4">アカウント設定</h2>
                <div className="min-h-[70vh]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : settings ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label
                                    htmlFor="promptTemplate"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    プロンプトテンプレート
                                </label>
                                <textarea
                                    id="promptTemplate"
                                    name="promptTemplate"
                                    value={settings.promptTemplate}
                                    onChange={handleChange}
                                    className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={4}
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="model"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    モデル
                                </label>
                                <select
                                    id="model"
                                    name="model"
                                    value={settings.model}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    <option value="gpt-4">GPT-4</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                    <option value="gpt-4o-mini">GPT-4o mini</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label
                                    htmlFor="temperature"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    ランダム性（Temperature）: {settings.temperature.toFixed(1)}
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    0に近いほど一貫した出力、1に近いほど多様な出力になります。
                                </p>
                                <input
                                    type="range"
                                    id="temperature"
                                    name="temperature"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={settings.temperature}
                                    onChange={handleChange}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>一貫性重視</span>
                                    <span>多様性重視</span>
                                </div>
                            </div>
                            {error && <p className="text-red-500 mb-4">{error}</p>}
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={setDefaultSettings}
                                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    デフォルトに戻す
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isSaving ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p>設定の読み込みに失敗しました。</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default AccountSettingsModal;
