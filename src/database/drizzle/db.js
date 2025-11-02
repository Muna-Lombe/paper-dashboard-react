"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrizzleDb = getDrizzleDb;
var d1_1 = require("drizzle-orm/d1");
var schema = require("../../../drizzle/schema");
function getDrizzleDb(d1) {
    return (0, d1_1.drizzle)(d1, { schema: schema });
}
