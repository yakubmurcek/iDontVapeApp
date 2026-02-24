# 🧬 Recovery Milestones (Timings & Medical Details)

The app breaks down your recovery into three major organs/systems: Heart, Lungs, and Blood Vessels. Each milestone triggers exactly at the specified time after your quit date.

## ❤️ Heart & Cardiovascular (Fastest to Recover)

- **20 Minutes (0.33 Hours): Heart Rate Drops**
  - _System Name:_ `CARDIAC_RATE_NORMALIZING`
  - _Medical Description:_ Your heart rate begins returning to normal as nicotine leaves your bloodstream. The constant stimulant pressure on your cardiac system is lifting.
- **2 Hours: Blood Pressure Normalized**
  - _System Name:_ `BP_STABILIZED`
  - _Medical Description:_ Blood pressure stabilizes as your arteries relax. The toxic constriction that forced your heart to work overtime is easing.
- **24 Hours: Heart Rate Stabilized**
  - _System Name:_ `CARDIAC_RHYTHM_STABLE`
  - _Medical Description:_ Your resting heart rate has normalized. Your heart no longer races from the constant chemical assault of nicotine and propylene glycol.
- **1 Week (168 Hours): Cardiac Stress Reduced**
  - _System Name:_ `CARDIAC_LOAD_REDUCED`
  - _Medical Description:_ Inflammation around your heart muscle is dropping. The oxidative stress that was slowly damaging cardiac tissue is fading.
- **1 Year (8760 Hours): Heart Attack Risk Decreased**
  - _System Name:_ `CARDIAC_RISK_LOWERED`
  - _Medical Description:_ Your risk of heart attack has significantly decreased. Arterial walls are healing and blood flow is approaching that of a non-vaper.

## 🫁 Lungs (Slower to Recover)

- **8 Hours: Blood Oxygen Normalized**
  - _System Name:_ `O2_SATURATION_OPTIMAL`
  - _Medical Description:_ Your blood oxygen levels are returning to normal. Cells throughout your body are receiving the oxygen they were starved of.
- **2 Days (48 Hours): Carbon Monoxide Purged**
  - _System Name:_ `CO_PURGE_COMPLETE`
  - _Medical Description:_ Carbon monoxide has been fully eliminated from your blood. Your hemoglobin can carry oxygen again instead of poison.
- **3 Days (72 Hours): Bronchial Tubes Relaxing**
  - _System Name:_ `BRONCHIAL_TENSION_REDUCED`
  - _Medical Description:_ Your bronchial tubes are relaxing and opening up. Breathing becomes easier as the chemical irritation subsides.
- **2 Weeks (336 Hours): Cilia Regeneration Started**
  - _System Name:_ `CILIA_REGEN_ACTIVE`
  - _Medical Description:_ The tiny hair-like structures in your lungs are regrowing. These cilia sweep out mucus and toxins - vaping destroyed them.
- **1 Month (720 Hours): Mucus Clearance Improved**
  - _System Name:_ `MUCOCILIARY_FUNCTION_RESTORED`
  - _Medical Description:_ Your lungs can now effectively clear mucus and trapped particles. The persistent cough may fade as your airways heal.
- **3 Months (2160 Hours): Lung Capacity Improved**
  - _System Name:_ `PULMONARY_CAPACITY_RESTORED`
  - _Medical Description:_ Significant improvement in lung capacity. Physical activities feel easier and you can take deeper, fuller breaths.
- **9 Months (6480 Hours): Lung Inflammation Reduced**
  - _System Name:_ `PULMONARY_INFLAMMATION_DOWN`
  - _Medical Description:_ Chronic lung inflammation has substantially decreased. The scarring and irritation from vaping aerosols is healing.

## 🩸 Blood Vessels

- **3 Days (72 Hours): Nicotine Cleared**
  - _System Name:_ `NICOTINE_FLUSH_COMPLETE`
  - _Medical Description:_ Nicotine has been fully flushed from your system. Your brain is rewiring its dopamine pathways - withdrawal peaks now but fades fast.
- **2 Weeks (336 Hours): Circulation Improving**
  - _System Name:_ `VASCULAR_FLOW_IMPROVING`
  - _Medical Description:_ Blood vessel walls are repairing. Endothelial function improves as nitric oxide production normalizes, meaning better blood flow everywhere.
- **3 Months (2160 Hours): Circulation Restored**
  - _System Name:_ `VASCULAR_FLOW_OPTIMAL`
  - _Medical Description:_ Vascular function is approaching normal. The toxic sludge that was increasing permeability and clot risk has been cleared.

---

# 🔥 Streak System

The streak in the app is specifically a **Scan Streak**. It monitors how consistently you run your "Daily Bio-Twin scans".

- **How it increments:** Whenever you run a diagnostic scan, the app checks the time since your last scan. If it has been between 24 and 48 hours, your streak increases by 1. (Multiple scans in the same calendar day won't increment it further).
- **How it breaks:** If more than 48 hours pass without running a diagnostic scan, your streak breaks and resets to `1` upon your next scan.
- **Longest Streak:** The application also tracks your all-time longest streak to date.

---

# 🔔 Notifications & Alerts

The app schedules several automated local push notifications:

1. **Milestone Alerts**
   - _When:_ Proactively scheduled for the exact moment you cross a timeline threshold (e.g., exactly at the 20-minute mark, 2-hour mark, etc., after your quit date).
   - _Message Format:_
     - **Title:** `SYSTEM ALERT: [System Name]` _(e.g. SYSTEM ALERT: O2_SATURATION_OPTIMAL)_
     - **Body:** `[Milestone Name] complete. Tap to view repair sequence.` _(e.g. Blood Oxygen Normalized complete. Tap to view repair sequence.)_

2. **Daily Diagnostic Reminder**
   - _When:_ Every day at 9:00 AM (default time).
   - _Message Format:_
     - **Title:** `SYSTEM DIAGNOSTIC READY`
     - **Body:** `Run your daily Bio-Twin scan to track recovery progress.`

3. **Inactivity Warning**
   - _When:_ Triggered dynamically if 48 hours pass without you interacting with the app or running a scan.
   - _Message Format:_
     - **Title:** `WARNING: System integrity declining`
     - **Body:** `Your Bio-Twin needs monitoring. Run a diagnostic.`

4. **Relapse Resets**
   - If you log a relapse, the app immediately cancels all queued notifications, resyncs your quit date to the current time, and silently reschedules all upcoming milestones, daily reminders, and inactivity warnings based on the new date.
