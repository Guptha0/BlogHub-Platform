import React, { useState } from 'react';
import { userService } from '../../services/api';
import {
  FiDollarSign,
  FiHeart,
  FiCoffee,
  FiX,
  FiCheckCircle,
  FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PRESET_AMOUNTS = [
  { amount: 2, label: '☕ Espresso', sub: '$2' },
  { amount: 5, label: '🍩 Coffee & Donut', sub: '$5' },
  { amount: 10, label: '🚀 Superfan Meal', sub: '$10' },
  { amount: 25, label: '🌟 Patron Sponsor', sub: '$25' },
];

const TipJarModal = ({ isOpen, onClose, author, postId, onTipSuccess }) => {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const effectiveAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleSendTip = async (e) => {
    e.preventDefault();
    if (!effectiveAmount || effectiveAmount <= 0) {
      toast.error('Please specify a tip amount greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      const res = await userService.sendTip(author._id, {
        amount: effectiveAmount,
        message: message.trim(),
        postId,
      });

      if (res.data.success) {
        setSuccess(true);
        toast.success(`Sent $${effectiveAmount.toFixed(2)} tip to ${author.name}!`);
        if (onTipSuccess) onTipSuccess(effectiveAmount);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1600);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send tip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-7 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
        >
          <FiX className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Tip Sent with Love!
            </h3>
            <p className="text-xs text-slate-500">
              ${effectiveAmount.toFixed(2)} has been credited instantly to {author.name}'s wallet.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendTip} className="space-y-5">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <FiCoffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Tip {author?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Support this writer directly with micro-patronage
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_AMOUNTS.map((p) => {
                const isSelected = selectedAmount === p.amount && !customAmount;
                return (
                  <button
                    type="button"
                    key={p.amount}
                    onClick={() => {
                      setSelectedAmount(p.amount);
                      setCustomAmount('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-navy-950 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      {p.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Or Custom USD ($)
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="e.g. 15"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Cheer / Encouraging Note (Optional)
              </label>
              <input
                type="text"
                placeholder="Thanks for the insightful breakdown!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={120}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center space-x-2 transition"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiHeart className="w-4 h-4" />
                  <span>Send ${effectiveAmount ? effectiveAmount.toFixed(2) : '0.00'} Tip</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TipJarModal;
