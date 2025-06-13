/**
 *  Copyright (C) 2025 Jan Leigh Muñoz
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 **/

import { db } from "../lib/database/client";
import fs from "fs";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const dbExists = fs.existsSync("./akari.db");

if (!dbExists) {
	console.log("Database file not found. Creating new database...");
	fs.writeFileSync("./akari.db", "");
}

console.log("Running database migrations...");
migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations complete!");
