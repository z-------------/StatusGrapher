package yy.gov.yeyacraft.statusgrapher;

import java.util.*;
import org.bukkit.plugin.java.JavaPlugin;
import org.apache.commons.io.IOUtils;
import java.nio.charset.StandardCharsets;
import org.bukkit.Bukkit;
import org.bukkit.event.Listener;
import org.json.simple.JSONObject;

import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import static spark.Spark.*;

public class Main extends JavaPlugin implements Listener {
	
	TimerTask calculateTPSTask = new CalculateValues();
	
	@Override
    public void onEnable() {
		
		getLogger().info("onEnable");
		
		// set up Timer for TPS
		
		long delay = 0;
		long period = (long) (10 * 1000);
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
				
				float tps = ((CalculateValues) calculateTPSTask).getTPS();
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
				JSONObject pastData = new JSONObject();
				
				pastData.put("tps", ((CalculateValues) calculateTPSTask).getTPSRecord());
				pastData.put("playerCount", ((CalculateValues) calculateTPSTask).getPlayerCountRecord());
				
				res.type("application/json");
				return pastData.toString();
			}
		});
		
    }
   
    @Override
    public void onDisable() {
    	getLogger().info("onDisable");
    }
    
}
