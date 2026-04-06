import React from 'react';
import { useLang } from '../context/LanguageContext';
import { toolAboutTranslations, ToolAboutContent } from '../i18n/toolContent';
import { parse } from 'marked';
import { BookOpen, AlertCircle, Star } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';
import { tools } from '../tools-registry';

interface ToolAboutProps {
  toolId: string;
  toolName: string;
  category?: string;
  onSupport?: () => void;
  howToUse?: string;
  commonErrors?: string;
}

export const ToolAbout: React.FC<ToolAboutProps> = ({ toolId, toolName, category, onSupport, howToUse, commonErrors }) => {
  const { t, lang } = useLang();
  const [userRating, setUserRating] = usePersistentState<number>(`devkit-rating-${toolId}`, 0);

  // Use 'vi' or 'en' from the translation store, fallback to 'en'
  const currentLang = (lang === 'vi' ? 'vi' : 'en') as 'en' | 'vi';
  const specificContent = toolAboutTranslations[currentLang]?.[toolId];

  // Generic content generators for tools without specific entries
  const getGenericContent = (): ToolAboutContent => {
    const isVi = currentLang === 'vi';
    
    // Default suggestion based on category
    let complementary;
    if (category === 'json' && toolId !== 'json-formatter') {
      complementary = {
        id: 'json-formatter',
        name: 'JSON Formatter',
        textEN: 'Need to format your JSON results? Use our',
        textVI: 'Cần định dạng kết quả JSON của bạn? Hãy dùng'
      };
    } else if (category === 'converter' && toolId !== 'base64-encode-decode') {
      complementary = {
        id: 'base64-encode-decode',
        name: 'Base64 Tool',
        textEN: 'Need to handle other binary formats? Check out our',
        textVI: 'Cần xử lý các định dạng nhị phân khác? Hãy xem'
      };
    } else if (category === 'generator' && toolId !== 'password-generator') {
      complementary = {
        id: 'password-generator',
        name: 'Password Generator',
        textEN: 'Looking for a secure random string? Try',
        textVI: 'Tìm kiếm một chuỗi ngẫu nhiên an toàn? Hãy thử'
      };
    } else if (category === 'web' && toolId !== 'html-formatter') {
      complementary = {
        id: 'html-formatter',
        name: 'HTML Formatter',
        textEN: 'Cleaning up your markup next? Try our',
        textVI: 'Tiếp theo là dọn dẹp markup của bạn? Dùng ngay'
      };
    }

    return {
      what: isVi
        ? `${toolName} là một phần trong bộ sưu tập công cụ lập trình siêu nhanh, miễn phí và an toàn. Công cụ này hoạt động hoàn toàn trên trình duyệt của bạn, giúp xử lý các tác vụ nhanh chóng mà không cần cài đặt phần mềm.`
        : `${toolName} is part of a premium suite of high-performance developer tools that are free, fast, and secure. It runs entirely in your browser, enabling you to process tasks instantly without installing any software.`,
      why: [
        {
          title: isVi ? 'Xử lý ngay lập tức' : 'Instant Processing',
          desc: isVi ? 'Không cần cài đặt, không cần đăng ký. Chỉ cần dán dữ liệu và nhận kết quả.' : 'No installation or registration required. Simply paste your data and get results instantly.'
        },
        {
          title: isVi ? 'Bảo mật 100%' : '100% Privacy',
          desc: isVi ? 'Mọi thao tác diễn ra trên máy của bạn. Tuyệt đối không có dữ liệu nào bị gửi đi.' : 'Everything happens locally on your device. No data is ever sent to our servers.'
        },
        {
          title: isVi ? 'Giao diện hiện đại' : 'Premium UX',
          desc: isVi ? 'Thiết kế tinh tế, hỗ trợ Dark Mode và tối ưu hiệu suất tối đa.' : 'Beautifully designed interface with Dark Mode support and performance optimizations.'
        }
      ],
      faqs: [
        {
          q: isVi ? 'Tôi có phải trả phí không?' : 'Is this tool free?',
          a: isVi ? 'Không, tất cả công cụ tại DevTools Online đều hoàn toàn miễn phí và không có quảng cáo phiền nhiễu.' : 'No, all tools on DevTools Online are completely free to use with no hidden costs or annoying ads.'
        },
        {
          q: isVi ? 'Dữ liệu của tôi có an toàn không?' : 'Is my data secure?',
          a: isVi ? 'Có. Chúng tôi ưu tiên quyền riêng tư của bạn bằng cách xử lý mọi thứ bằng JavaScript ngay trong trình duyệt của bạn.' : 'Yes. We prioritize your privacy by processing everything using client-side JavaScript right in your browser.'
        }
      ],
      complementary
    };
  };

  const content = specificContent || getGenericContent();

  return (
    <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* What & Why */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t.toolAbout.what(toolName)}
            </h2>
            <div 
              className="text-gray-600 dark:text-gray-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.what }}
            />
            
            {content.complementary && (
              <div className="mt-6 p-4 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/30 flex items-center gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center text-lg">
                  💡
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {lang === 'vi' ? content.complementary.textVI : content.complementary.textEN}{' '}
                  <a 
                    href={(() => {
                      if (!content.complementary) return '#';
                      const comp = tools.find(t => t.id === content.complementary?.id);
                      return comp ? `/${comp.category}-tools/${comp.id}` : `/tool/${content.complementary?.id}`;
                    })()}
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    {content.complementary.name}
                  </a>
                </p>
              </div>
            )}
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t.toolAbout.why(toolName)}
            </h2>
            <ul className="space-y-3">
              {content.why.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-primary-500 font-bold shrink-0">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-gray-200 uppercase text-[10px] tracking-wider">{item.title}:</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* How to use & Common Errors */}
        {(howToUse || commonErrors) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12 border-t border-gray-100 dark:border-gray-900">
            {howToUse && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <BookOpen size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                    {t.toolAbout.how(toolName)}
                  </h2>
                </div>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 prose-ol:list-decimal prose-ul:list-disc leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parse(howToUse) }}
                />
              </section>
            )}
            {commonErrors && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                    <AlertCircle size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                    {t.toolAbout.commonErrors}
                  </h2>
                </div>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 prose-ul:list-disc leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parse(commonErrors) }}
                />
              </section>
            )}
          </div>
        )}

        {/* Example */}
        {content.example && (
          <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t.toolAbout.example}
            </h2>
            {typeof content.example === 'string' ? (
              <div className="bg-white dark:bg-gray-950 p-4 rounded border border-gray-200 dark:border-gray-800 text-primary-600 dark:text-primary-400 font-mono text-center text-sm md:text-lg">
                {content.example}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2">
                  <span className="text-gray-400 uppercase tracking-wider">{t.toolAbout.before}</span>
                  <div className="bg-white dark:bg-gray-950 p-3 rounded border border-gray-200 dark:border-gray-800 text-gray-500 truncate">
                    {content.example.before}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-gray-400 uppercase tracking-wider">{t.toolAbout.after}</span>
                  <div className="bg-white dark:bg-gray-950 p-3 rounded border border-gray-200 dark:border-gray-800 text-primary-600 dark:text-primary-400 whitespace-pre overflow-x-auto">
                    {content.example.after}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t.toolAbout.faq}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.faqs.map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{item.q}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tool Rating Section */}
        <section className="pt-12 border-t border-gray-100 dark:border-gray-900 text-center">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest opacity-60">
              {t.toolAbout.rate(toolName)}
            </h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`p-1.5 transition-all transform active:scale-125 ${userRating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200 dark:text-gray-700 hover:text-yellow-200'}`}
                >
                  <Star size={32} fill={userRating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 italic">
              {userRating > 0 
                ? t.toolAbout.thanksRating
                : t.toolAbout.ratingHelp}
            </p>
        </section>

        {/* Support Link */}
        <div className="text-center pt-8">
          <p className="text-gray-400 text-sm">
            {t.toolAbout.stillQuestions}{' '}
            <button
              onClick={onSupport}
              className="text-primary-600 font-medium hover:underline"
            >
              {t.toolAbout.contactSupport}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
