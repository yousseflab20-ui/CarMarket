import { User as UserIcon } from "lucide-react";

interface HeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}

export const SelectableHeaderAvatar = ({ allSelected, someSelected, onToggleAll }: HeaderProps) => {
  return (
    <div className="relative w-9 h-9 group/hdr cursor-pointer" onClick={onToggleAll}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150
        ${someSelected ? "opacity-0 scale-90" : "opacity-100 scale-100 group-hover/hdr:opacity-0 group-hover/hdr:scale-90"}
        bg-slate-100 border border-slate-200`}>
        <UserIcon size={16} className="text-slate-400" />
      </div>
      <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-150
        ${someSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover/hdr:opacity-100 group-hover/hdr:scale-100"}`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors
          ${allSelected ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300 group-hover/hdr:border-slate-400"}`}>
          {allSelected
            ? <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : someSelected
              ? <div className="w-3.5 h-0.5 bg-slate-400 rounded" />
              : <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
          }
        </div>
      </div>
    </div>
  );
};

interface RowProps {
  isSelected: boolean;
  photo?: string | null;
  name: string;
  onToggle: () => void;
}

export const SelectableRowAvatar = ({ isSelected, photo, name, onToggle }: RowProps) => {
  return (
    <div className="relative w-9 h-9 shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden absolute inset-0 transition-all duration-150
        ${isSelected
          ? "opacity-0 scale-90"
          : "opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-90"
        } border-slate-200 bg-slate-100`}>
        {photo
          ? <img src={photo} alt={name} className="w-full h-full object-cover" />
          : <UserIcon size={16} className="text-slate-400" />
        }
      </div>
      {/* Checkbox circle */}
      <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-150
        ${isSelected
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
        }`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors
          ${isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300 group-hover:border-slate-400"}`}>
          {isSelected
            ? <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
          }
        </div>
      </div>
    </div>
  );
};
