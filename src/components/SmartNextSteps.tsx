import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { tools } from '../tools-registry';
import { encodeShareData } from '../utils/shareUtils';
import { useLang } from '../context/LanguageContext';

interface SmartNextStepsProps {
  currentToolId: string;
  output: string | any;
  visible?: boolean;
}

export const SmartNextSteps: React.FC<SmartNextStepsProps> = ({ currentToolId, output, visible = true }) => {
  const { lang } = useLang();
  const isVi = lang === 'vi';
  
  if (!visible || !output || output.length < 2) return null;

  const currentTool = tools.find(t => t.id === currentToolId);
  const suggestedIds = currentTool?.suggestedTools || [];
  
  if (suggestedIds.length === 0) return null;

  const suggestedTools = suggestedIds
    .map(id => tools.find(t => t.id === id))
    .filter(Boolean);

  const encodedData = encodeShareData(output);

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          {isVi ? 'Gợi Ý Tiếp Theo' : 'Smart Next Steps'}
        </h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {suggestedTools.map((tool: any) => (
          <Link
            key={tool.id}
            to={`/tool/${tool.id}?s=${encodedData}`}
            className="group flex flex-col p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all w-full sm:w-[220px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{tool.icon}</span>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{tool.name}</p>
              <p className="text-[10px] text-gray-400 line-clamp-1">
                {isVi ? `Chuyển sang ${tool.name}` : `Continue with ${tool.name}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
