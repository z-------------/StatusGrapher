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
import java.util.regex.Pattern;

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

		// set up Timer for recalculating TPS

		long delay = 0;
		long period = (long) (10 * 1000);
		Timer timer = new Timer(true);
		timer.scheduleAtFixedRate(calculateTPSTask, delay, period);

		// set up Spark server and routes

		final String staticFilesRoot = "/main/resources/static";

		get("/", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				res.type("text/html");
				return IOUtils.toString(
						Spark.class.getResourceAsStream(staticFilesRoot + "/index.html"),
						StandardCharsets.UTF_8.name()
						);
			}
		});
		
		final ArrayList<String> staticRoutes = new ArrayList<String>();
		staticRoutes.add("script.js");
		staticRoutes.add("stats.js");
		staticRoutes.add("basicHelpers.js");
		staticRoutes.add("style.css");
		staticRoutes.add("chartjs/Chart.bundle.min.js");
		staticRoutes.add("chartjs/chartjs-plugin-zoom.min.js");

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
		
		get("/:path", new Route() {
			public Object handle(Request req, Response res) throws Exception {
				String path = req.params(":path");
				if (staticRoutes.contains(path)) {
					String[] pathParts = path.split(Pattern.quote("."));
					String ext = pathParts[pathParts.length - 1];
					if (ext == "html") {
						res.type("text/html");
					} else if (ext == "js") {
						res.type("application/javascript");
					} else if (ext == "css") {
						res.type("text/css");
					} // Spark default Content-Type is text/html
					return IOUtils.toString(
							Spark.class.getResourceAsStream(staticFilesRoot + "/" + path),
							StandardCharsets.UTF_8.name()
							);
				} else {
					res.status(404);
					return "Error 404";
				}
			}
		});

    }

    @Override
    public void onDisable() {
    	getLogger().info("onDisable");
    }

}
