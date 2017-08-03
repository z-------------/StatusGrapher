package yy.gov.yeyacraft.statusgrapher;

import java.util.*;
import org.bukkit.plugin.java.JavaPlugin;
import org.apache.commons.io.IOUtils;
import java.nio.charset.StandardCharsets;
import org.bukkit.Bukkit;
import org.json.simple.JSONObject;

import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import static spark.Spark.*;

public class Main extends JavaPlugin {
	
	TimerTask calculateTPSTask = new CalculateTPSTask();
	
	@Override
    public void onEnable() {
		
		getLogger().info("onEnable");
		
		// set up timer
		
		long delay = 1000; // both in ms
		long period = 5000;
		Timer timer = new Timer(true);
		timer.scheduleAtFixedRate(calculateTPSTask, delay, period);
		
		// set up Spark server
		
		final String STATIC_FILES_LOCATION = "/static";
		
		get("/", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				return IOUtils.toString(
						Spark.class.getResourceAsStream(STATIC_FILES_LOCATION + "/index.html"),
						StandardCharsets.UTF_8.name()
						);
			}
		});
		
		get("/script.js", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				return IOUtils.toString(
						Spark.class.getResourceAsStream(STATIC_FILES_LOCATION + "/script.js"),
						StandardCharsets.UTF_8.name()
						);
			}
		});
		
		get("/update_data", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				String jsonString;
				
				float tps = ((CalculateTPSTask) calculateTPSTask).getTPS();
				int playerCount = Bukkit.getOnlinePlayers().size();
				long timeNow = System.currentTimeMillis();
				
				JSONObject json = new JSONObject();
				JSONObject data = new JSONObject();
				data.put("tps", tps);
				data.put("playerCount", playerCount);
				json.put("data", data);
				json.put("time", timeNow);
				
				jsonString = json.toString();
				
				res.type("application/json");
				
				return jsonString;
			}
		});
		
		get("/get_past_data", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				String jsonString = ((CalculateTPSTask) calculateTPSTask).getTPSRecord().toString();
				res.type("application/json");
				return jsonString;
			}
		});
		
    }
   
    @Override
    public void onDisable() {
    	
    	getLogger().info("onDisable");
    	getLogger().info("last calculated TPS: " + Float.toString(((CalculateTPSTask) calculateTPSTask).getTPS()));
       
    }
    
}
