# 🧬 Recovery Milestones (Timings & Details)

The app breaks down your recovery into three major organs/systems: Heart, Lungs, and Blood Vessels. Each milestone triggers exactly at the specified time after your quit date.

## ❤️ Heart & Cardiovascular (Fastest to Recover)

- **20 Minutes (0.33 Hours): Heart Rate Drops**
  - _System Name:_ `CARDIAC_RATE_NORMALIZING`
  - _Description:_ Nicotine is leaving your blood, so your heart does not need to work as hard.
- **2 Hours: Blood Pressure Settles**
  - _System Name:_ `BP_STABILIZED`
  - _Description:_ Your blood vessels start to relax, and your blood pressure moves toward a healthier range.
- **24 Hours: Heart Rate Stable**
  - _System Name:_ `CARDIAC_RHYTHM_STABLE`
  - _Description:_ Your resting heartbeat is becoming steadier without constant nicotine hits.
- **1 Week (168 Hours): Heart Strain Reduced**
  - _System Name:_ `CARDIAC_LOAD_REDUCED`
  - _Description:_ Daily strain on your heart is dropping, and your heart muscle is under less pressure.
- **1 Year (8760 Hours): Heart Risk Lowered**
  - _System Name:_ `CARDIAC_RISK_LOWERED`
  - _Description:_ As your blood flow improves, your long-term risk of heart attack keeps going down.

## 🫁 Lungs (Slower to Recover)

- **8 Hours: Oxygen Levels Up**
  - _System Name:_ `O2_SATURATION_OPTIMAL`
  - _Description:_ More oxygen reaches your body, helping your cells make energy more efficiently.
- **2 Days (48 Hours): CO Cleared**
  - _System Name:_ `CO_PURGE_COMPLETE`
  - _Description:_ Most carbon monoxide is gone from your blood, so oxygen can move through your body better.
- **3 Days (72 Hours): Airways Relaxing**
  - _System Name:_ `BRONCHIAL_TENSION_REDUCED`
  - _Description:_ Your airways are less tight and irritated, so breathing starts to feel easier.
- **2 Weeks (336 Hours): Lung Filters Rebuild**
  - _System Name:_ `CILIA_REGEN_ACTIVE`
  - _Description:_ Tiny filters in your lungs are growing back and starting to clear mucus and trapped particles.
- **1 Month (720 Hours): Mucus Clearing Better**
  - _System Name:_ `MUCOCILIARY_FUNCTION_RESTORED`
  - _Description:_ Your lungs clear buildup more effectively, so coughing and chest heaviness may start to ease.
- **3 Months (2160 Hours): Lung Capacity Up**
  - _System Name:_ `PULMONARY_CAPACITY_RESTORED`
  - _Description:_ Your lungs can use more air, so activity may feel easier and breaths feel deeper.
- **9 Months (6480 Hours): Lung Irritation Down**
  - _System Name:_ `PULMONARY_INFLAMMATION_DOWN`
  - _Description:_ Long-term irritation in your lungs is going down as damaged tissue keeps healing.

## 🩸 Blood Vessels

- **3 Days (72 Hours): Nicotine Cleared**
  - _System Name:_ `NICOTINE_FLUSH_COMPLETE`
  - _Description:_ Nicotine is out of your system, and strong withdrawal symptoms usually start easing after this point.
- **2 Weeks (336 Hours): Circulation Improving**
  - _System Name:_ `VASCULAR_FLOW_IMPROVING`
  - _Description:_ Your blood vessels are repairing, which helps blood move more smoothly through your body.
- **3 Months (2160 Hours): Circulation Restored**
  - _System Name:_ `VASCULAR_FLOW_OPTIMAL`
  - _Description:_ Your circulation is close to normal, supporting better energy, healing, and overall function.

---

# 🔥 Streak System

The streak in the app is your **Check-in Streak**. It monitors how consistently you run your daily Bio-Twin scan.

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
     - **Body:** `[Milestone Name] reached. Tap to view repair sequence.` _(e.g. Oxygen Levels Up reached. Tap to view repair sequence.)_

2. **Daily Diagnostic Reminder**
   - _When:_ Every day at 9:00 AM (default time).
   - _Message Format:_
     - **Title:** `SYSTEM DIAGNOSTIC READY`
     - **Body:** `Run your daily Bio-Twin scan to track healing progress.`

3. **Inactivity Warning**
   - _When:_ Triggered dynamically if 48 hours pass without you interacting with the app or running a scan.
   - _Message Format:_
     - **Title:** `WARNING: Check-in missed`
     - **Body:** `Your Bio-Twin needs a fresh scan. Run a diagnostic.`

4. **Relapse Resets**
   - If you log a relapse, the app immediately cancels all queued notifications, resyncs your quit date to the current time, and silently reschedules all upcoming milestones, daily reminders, and inactivity warnings based on the new date.
