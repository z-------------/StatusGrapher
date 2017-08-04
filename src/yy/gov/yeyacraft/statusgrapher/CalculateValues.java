//  Copyright 2017 Zachary James Guard
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

package yy.gov.yeyacraft.statusgrapher;

import java.util.TimerTask;

import org.bukkit.Bukkit;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import net.minecraft.server.v1_12_R1.MinecraftServer;

class CalculateValues extends TimerTask {
	
	private float tps;
	private JSONArray tpsRecord = new JSONArray();
	
	private int playerCount;
	private JSONArray playerCountRecord = new JSONArray();
	
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
    		
    		if (tpsRecord.size() > 1000) {
    			tpsRecord.remove(0);
    		}
    		
    	} else {
    		// waiting for second set of data to use to calculate TPS
    	}
    	
    	this.playerCount = Bukkit.getOnlinePlayers().size();
    	
    	JSONObject playerCountRecordItem = new JSONObject();
    	playerCountRecordItem.put("playerCount", this.playerCount);
    	playerCountRecordItem.put("time", timeNow);
    	playerCountRecord.add(playerCountRecordItem);
    	if (playerCountRecord.size() > 1000) {
    		playerCountRecord.remove(0);
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
    
    public int getPlayerCount() {
    	return this.playerCount;
    }
    
    public JSONArray getPlayerCountRecord() {
    	return this.playerCountRecord;
    }
    
}