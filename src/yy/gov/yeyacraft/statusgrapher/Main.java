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

		final String STATIC_FILES_LOCATION = "/main/resources/static";

		get("/", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				res.type("text/html");
				return IOUtils.toString(
						Spark.class.getResourceAsStream(STATIC_FILES_LOCATION + "/index.html"),
						StandardCharsets.UTF_8.name()
						);
			}
		});

		get("/script.js", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				res.type("application/javascript");
				return IOUtils.toString(
						Spark.class.getResourceAsStream(STATIC_FILES_LOCATION + "/script.js"),
						StandardCharsets.UTF_8.name()
						);
			}
		});

		get("/stats.js", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				res.type("application/javascript");
				return IOUtils.toString(
						Spark.class.getResourceAsStream(STATIC_FILES_LOCATION + "/stats.js"),
						StandardCharsets.UTF_8.name()
						);
			}
		});
		
		get("/basicHelpers.js", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				res.type("application/javascript");
				return IOUtils.toString(
						Spark.class.getResourceAsStream(STATIC_FILES_LOCATION + "/basicHelpers.js"),
						StandardCharsets.UTF_8.name()
						);
			}
		});

	    get("/style.css", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				res.type("text/css");
				return IOUtils.toString(
						Spark.class.getResourceAsStream(STATIC_FILES_LOCATION + "/style.css"),
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
