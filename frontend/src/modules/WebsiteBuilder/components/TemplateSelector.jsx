import React from 'react';
import { FiLayout, FiCheck } from 'react-icons/fi';
import { templates } from '../dummyData/templatesData';

const TemplateSelector = ({ selectedTemplateId, onSelect }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <FiLayout className="text-primary-500" />
                Select Template
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {templates.map((tpl) => (
                    <div 
                        key={tpl.templateId}
                        onClick={() => onSelect('selectedTemplate', tpl.templateId)}
                        className={`relative rounded-3xl overflow-hidden border-4 cursor-pointer transition-all ${
                            selectedTemplateId === tpl.templateId 
                            ? 'border-primary-500 shadow-xl scale-[1.02]' 
                            : 'border-white hover:border-gray-100 shadow-sm'
                        }`}
                    >
                        <img src={tpl.previewImage} alt={tpl.name} className="w-full h-40 object-cover" />
                        <div className="p-4 bg-white flex items-center justify-between">
                            <div>
                                <p className="font-black text-gray-900 leading-tight uppercase tracking-tighter">{tpl.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 capitalize">{tpl.layoutType} Layout</p>
                            </div>
                            {selectedTemplateId === tpl.templateId && (
                                <div className="bg-primary-500 text-white p-1.5 rounded-full">
                                    <FiCheck size={16} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;
