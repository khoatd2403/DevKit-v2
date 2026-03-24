import React from 'react';
import { useLang } from '../context/LanguageContext';
import { toolAboutTranslations, ToolAboutContent } from '../i18n/toolContent';

interface ToolAboutProps {
  toolId: string;
  toolName: string;
  onSupport?: () => void;
}

export const ToolAbout: React.FC<ToolAboutProps> = ({ toolId, toolName, onSupport }) => {
  const { lang } = useLang();
  
  // Use 'vi' or 'en' from the translation store, fallback to 'en'
  const currentLang = (lang === 'vi' ? 'vi' : 'en') as 'en' | 'vi';
  const specificContent = toolAboutTranslations[currentLang]?.[toolId];

  // Generic content generators for tools without specific entries
  const getGenericContent = (): ToolAboutContent => {
    const isVi = currentLang === 'vi';
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
      ]
    };
  };

  const content = specificContent || getGenericContent();
  const isVi = currentLang === 'vi';

  return (
    <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* What & Why */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isVi ? `Về ${toolName}` : `About ${toolName}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {content.what}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isVi ? 'Tại sao nên sử dụng?' : 'Why use this tool?'}
            </h2>
            <ul className="space-y-3">
              {content.why.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-primary-500 font-bold shrink-0">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-gray-200">{item.title}:</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Example */}
        {content.example && (
          <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {isVi ? 'Ví dụ minh họa' : 'Visual Example'}
            </h2>
            {typeof content.example === 'string' ? (
              <div className="bg-white dark:bg-gray-950 p-4 rounded border border-gray-200 dark:border-gray-800 text-primary-600 dark:text-primary-400 font-mono text-center text-sm md:text-lg">
                {content.example}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2">
                  <span className="text-gray-400 uppercase tracking-wider">{isVi ? 'Trước' : 'Before'}</span>
                  <div className="bg-white dark:bg-gray-950 p-3 rounded border border-gray-200 dark:border-gray-800 text-gray-500 truncate">
                    {content.example.before}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-gray-400 uppercase tracking-wider">{isVi ? 'Sau' : 'After'}</span>
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
            {isVi ? 'Câu hỏi thường gặp' : 'Frequently Asked Questions'}
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
        
        {/* Support Link */}
        <div className="text-center pt-8">
           <p className="text-gray-400 text-sm">
             {isVi ? 'Vẫn còn câu hỏi? ' : 'Still have questions? '}
             <button 
               onClick={onSupport}
               className="text-primary-600 font-medium hover:underline"
             >
               {isVi ? 'Liên hệ hỗ trợ' : 'Contact Support'}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};
