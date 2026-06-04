import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative glass-panel w-full max-w-sm rounded-[28px] overflow-hidden p-6 text-white border border-white/10 z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>

            {/* Warning Icon Banner */}
            <div className="flex flex-col items-center text-center mt-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                isDestructive 
                  ? "bg-rose-500/10 text-rose-450 border border-rose-500/20" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                <AlertTriangle size={22} />
              </div>

              <h3 className="text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed max-w-[260px]">
                {description}
              </p>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl text-xs font-bold"
              >
                {cancelText}
              </Button>
              <Button
                variant={isDestructive ? "destructive" : "default"}
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="h-11 rounded-xl text-xs font-bold"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
