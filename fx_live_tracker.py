# fx_live_tracker.py — Run the FX Agent on Autopilot

import schedule
import time
import os

# Define how to run your agent
def run_fx_agent():
    print("\n🔁 Running fx_core_agent.py (Live Tracker)...")
    os.system("python3 fx_core_agent.py")

# Schedule to run every 10 minutes
schedule.every(10).minutes.do(run_fx_agent)

print("\n📡 FX Live Tracker Running (updates every 10 minutes)...")
print("Press Ctrl+C to stop.\n")

# Initial immediate run
run_fx_agent()

while True:
    schedule.run_pending()
    time.sleep(1)
