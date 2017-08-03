package yy.gov.yeyacraft.statusgrapher;

import java.util.TimerTask;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import net.minecraft.server.v1_12_R1.MinecraftServer;

class CalculateTPSTask extends TimerTask {
	
	private float tps;
	private JSONArray tpsRecord = new JSONArray();
	
	long timeLastRun; // default value is 0L
	int tickLastRun; // default value is 0
	
    @Override
    public void run() {
    	
    	long timeNow = System.currentTimeMillis();
    	int tickNow = MinecraftServer.currentTick;
    	
    	if (timeLastRun != 0L && tickLastRun != 0) {
    		
    		float tpsCalculated = (float) (tickNow - tickLastRun) / ((timeNow - timeLastRun) / 1000);
    		
    		if (tpsCalculated > 20F) {
    			this.tps = 20F;
    		} else {
    			this.tps = tpsCalculated;
    		}
    		
    		JSONObject tpsRecordItem = new JSONObject();
    		tpsRecordItem.put("tps", this.tps);
    		tpsRecordItem.put("time", timeNow);
    		
    		tpsRecord.add(tpsRecordItem);
    		
    	} else {
    		// waiting for second set of data to use to calculate TPS
    	}
    	
    	timeLastRun = System.currentTimeMillis();
		tickLastRun = MinecraftServer.currentTick;
    	
    }
    
    public float getTPS() {
    	
    	return this.tps;
    	
    }
    
    public JSONArray getTPSRecord() {
    	
    	return this.tpsRecord;
    	
    }
    
}