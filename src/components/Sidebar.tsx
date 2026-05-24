import React from 'react';
import { Layout, Building2, Briefcase, GraduationCap, Clock, PieChart, Globe, ChevronDown } from 'lucide-react';
import { COMPANIES, ROLE_TYPES, SENIORITY_LEVELS, INTERVIEW_ROUNDS, INDUSTRY_VERTICALS } from '../constants';

interface SidebarProps {
  selectedCompany: string;
  setSelectedCompany: (v: string) => void;
  customCompanyUrl: string;
  setCustomCompanyUrl: (v: string) => void;
  selectedRole: string;
  setSelectedRole: (v: string) => void;
  selectedLevel: string;
  setSelectedLevel: (v: string) => void;
  selectedRound: string;
  setSelectedRound: (v: string) => void;
  selectedIndustry: string;
  setSelectedIndustry: (v: string) => void;
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="w-full md:w-80 bg-transparent flex flex-col h-full shrink-0 overflow-y-auto">
      <div className="p-6 hidden md:flex items-center gap-3 sticky top-0 bg-[#F5F5F7]/80 backdrop-blur-xl z-10">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
          <Layout className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-xl tracking-tight text-[#1D1D1F]">DesignPrep.io</span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-black/50 flex items-center gap-2 mb-1">
            <Building2 className="w-[14px] h-[14px]" /> Company Target
          </label>
          <div className="relative">
            <select 
              value={props.selectedCompany === 'Custom' ? 'Custom' : props.selectedCompany} 
              onChange={(e) => props.setSelectedCompany(e.target.value)}
              className="w-full appearance-none bg-white border border-black/5 rounded-xl pl-4 pr-11 py-2.5 text-[14px] outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[#1D1D1F]"
            >
              <option value="Custom">+ Add Custom Website...</option>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
          </div>
          {props.selectedCompany === 'Custom' && (
             <div className="relative mt-2">
                <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="url"
                  placeholder="e.g. linear.app"
                  value={props.customCompanyUrl}
                  onChange={(e) => props.setCustomCompanyUrl(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-2.5 text-[14px] outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[#1D1D1F]"
                />
             </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-black/50 flex items-center gap-2 mb-1">
            <Briefcase className="w-[14px] h-[14px]" /> Design Role
          </label>
          <div className="relative">
            <select 
              value={props.selectedRole} 
               onChange={(e) => props.setSelectedRole(e.target.value)}
              className="w-full appearance-none bg-white border border-black/5 rounded-xl pl-4 pr-11 py-2.5 text-[14px] outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[#1D1D1F]"
            >
              {ROLE_TYPES.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-black/50 flex items-center gap-2 mb-1">
            <GraduationCap className="w-[14px] h-[14px]" /> Seniority Level
          </label>
          <div className="relative">
            <select 
              value={props.selectedLevel} 
               onChange={(e) => props.setSelectedLevel(e.target.value)}
              className="w-full appearance-none bg-white border border-black/5 rounded-xl pl-4 pr-11 py-2.5 text-[14px] outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[#1D1D1F]"
            >
              {SENIORITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-black/50 flex items-center gap-2 mb-1">
            <Clock className="w-[14px] h-[14px]" /> Interview Round
          </label>
          <div className="relative">
            <select 
              value={props.selectedRound} 
               onChange={(e) => props.setSelectedRound(e.target.value)}
              className="w-full appearance-none bg-white border border-black/5 rounded-xl pl-4 pr-11 py-2.5 text-[14px] outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[#1D1D1F]"
            >
              {INTERVIEW_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-black/50 flex items-center gap-2 mb-1">
            <PieChart className="w-[14px] h-[14px]" /> Industry Vertical
          </label>
          <div className="relative">
            <select 
              value={props.selectedIndustry} 
               onChange={(e) => props.setSelectedIndustry(e.target.value)}
              className="w-full appearance-none bg-white border border-black/5 rounded-xl pl-4 pr-11 py-2.5 text-[14px] outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-[#1D1D1F]"
            >
              {INDUSTRY_VERTICALS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="mt-auto p-6 hidden">
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 border border-black/5 shadow-sm text-center">
          <span className="text-[13px] font-semibold text-[#1D1D1F]">Ready to practice?</span>
          <p className="text-[12px] text-black/50 leading-relaxed">Customize your prep by mixing combinations of role, company, and round.</p>
        </div>
      </div>
    </aside>
  );
}
