//slippage
//priorityfee
//mevfee
//priofeeToggle
//mevfeeToggle

//TODO: Add a toggle for each of the above
//TODO: Add slippage, pFee, mFee to the session handler
//TODO: Add slippage, pFee, mFee to the settings handler

'use client';
import { ChangeEvent, useState, forwardRef, useImperativeHandle } from 'react';
import { PriorityFee, Slippage, MevFee } from '@/config/transactionConfig';
import { useSessionHandler } from '@/store/SessionHandler';
import { toast } from 'sonner';
import { useSettingsHandler } from '@/store/SettingsHandler';
import { set } from 'zod';

interface TransactionConfigSettingsProps {}

export interface TransactionConfigSettingsRef {
  onSubmit: () => void;
}

export const AIConfigSettings = forwardRef<
  TransactionConfigSettingsRef,
  TransactionConfigSettingsProps
>((_, ref) => {
  /**
   * Global State
   */
  const {
    slippage,
    priorityFee,
    mevFee,
    setSlippage,
    setPriorityFee,
    setMevFee,
    isPriorityFeeOn,
    isMevFeeOn,
  } = useTransactionHandler(); //TODO

  const { updateSettings } = useSettingsHandler();

  /**
   * Local State
   */
  const [slippageLocal, setSlippageLocal] = useState<string>(slippage);
  const [priorityFeeLocal, setPriorityFeeLocal] = useState<string>(priorityFee);
  const [mevFeeLocal, setMevFeeLocal] = useState<string>(mevFee);

  const handleSlippageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let newSlippage = e.target.value as (typeof Slippage)[number];
    if (newSlippage != 'Custom') {
      setSlippage(newSlippage);
    } else {
      newSlippage = getSlippageFromUser(); //TODO
      setSlippage(newSlippage);
    }
    updateSession('slippage');
    updateSettings('slippage');
    toast.success(`Slippage has been set to ${newSlippage} bps`);
  };
  const handlePriorityFeeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let newPriorityFee = e.target.value as (typeof PriorityFee)[number];
    if (newPriorityFee != 'Custom') {
      setPriorityFee(newPriorityFee);
    } else {
      newPriorityFee = getPriortyFeeFromUser(); //TODO
      setPriorityFee(newPriorityFee);
    }
    updateSession('priorityFee');
    updateSettings('priorityFee');
    toast.success(`Priority Fee has been set to ${newPriorityFee}`);
  };
  const handleMevFeeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let newMevFee = e.target.value as (typeof MevFee)[number];
    if (newMevFee != 'Custom') {
      setMevFee(newMevFee);
    } else {
      newMevFee = getMevFeeFromUser(); //TODO
      setMevFee(newMevFee);
    }
    updateSession('mevFee');
    updateSettings('mevFee');
    toast.success(`MevFee has been set to ${newMevFee}`);
  };

  useImperativeHandle(ref, () => ({
    onSubmit: () => {
      if (slippageLocal !== slippage) {
        setSlippage(slippageLocal);
        updateSession('slippage');
        updateSettings('slippage');
      }
      if (priorityFeeLocal !== priorityFee) {
        setPriorityFee(priorityFeeLocal);
        updateSession('priority_fee');
        updateSettings('priority_fee');
      }
      if (mevFeeLocal !== mevFee) {
        setMevFee(mevFeeLocal);
        updateSession('mev_fee');
        updateSettings('mev_fee');
      }
    },
  }));

  return (
    <div className="flex flex-col items-start justify-center gap-y-6">
      {/* Priority Fee Area */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor">
          Helius Priority Fee Config :
        </h1>
        <p className="font-regular text-secText">
          Set the priority fee needed to land transactions.
        </p>
        <select
          className="border border-border rounded-md p-3 mt-2 bg-sec_background text-textColor"
          value={priorityFee || ''}
          onChange={handlePriorityFeeChange}
        >
          <option value="" disabled>
            Select Priority Fee
          </option>
          {PriorityFee.map((fee) => (
            <option key={fee} value={fee}>
              {fee.charAt(0).toUpperCase() + fee.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full">
        <h1 className="font-semibold text-textColor">Jito MEV Config :</h1>
        <p className="font-regular text-secText">
          Set the jito mev tip needed to land transactions.
        </p>
        <select
          className="border border-border rounded-md p-3 mt-2 bg-sec_background text-textColor"
          value={mevFee || ''}
          onChange={handleMevFeeChange}
        >
          <option value="" disabled>
            Select Mev Fee
          </option>
          {MevFee.map((fee) => (
            <option key={fee} value={fee}>
              {fee.charAt(0).toUpperCase() + fee.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* SLippage Area */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor">Slippage</h1>
        <p className="font-regular text-secText">
          Set the Slippage to land transactions.
        </p>
        <select
          className="border border-border rounded-md p-3 mt-2 bg-sec_background text-textColor"
          value={slippage || ''}
          onChange={handleSlippageChange}
        >
          <option value="" disabled>
            Select Slippage
          </option>
          {Slippage.map((fee) => (
            <option key={fee} value={fee}>
              {fee.charAt(0).toUpperCase() + fee.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

AIConfigSettings.displayName = 'AIConfigSettings';
