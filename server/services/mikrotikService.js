// server/services/mikrotikService.js (REAL VERSION)
const { RouterOSAPI } = require("node-routeros");

class MikrotikService {
  constructor() {
    this.routers = new Map();
  }

  // Register router configuration
  registerRouter(resellerId, config) {
    this.routers.set(resellerId, {
      host: config.ip,
      user: config.username || "admin",
      password: config.password,
      port: config.port || 8728,
    });
  }

  // Create actual connection to MikroTik
  async connect(resellerId) {
    const config = this.getRouterConfig(resellerId);
    if (!config) {
      throw new Error("Router not configured for this reseller");
    }

    const conn = new RouterOSAPI({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      timeout: 5000,
    });

    try {
      await conn.connect();
      console.log(`✅ Connected to MikroTik at ${config.host}`);
      return conn;
    } catch (error) {
      console.error(
        `❌ Failed to connect to MikroTik at ${config.host}:`,
        error.message
      );
      throw error;
    }
  }

  // REAL user creation in MikroTik
  async createHotspotUser(resellerId, sessionDetails, userCode) {
    const conn = await this.connect(resellerId);

    try {
      const username = `user_${userCode}`;
      const password = this.generatePassword();
      const sessionTimeout = this.formatSessionTimeout(
        sessionDetails.sessionMinutes
      );

      // Create user in MikroTik hotspot
      const createCommand = [
        "/ip/hotspot/user/add",
        `=name=${username}`,
        `=password=${password}`,
        `=profile=dynamic-user`,
        `=limit-uptime=${sessionTimeout}`,
        `=rate-limit=${sessionDetails.speed}`,
        `=comment=Amount: KSh${sessionDetails.amount} - ${sessionDetails.tier} - Auto created`,
      ];

      await conn.write(createCommand);

      console.log(
        `✅ Created MikroTik user: ${username}, Session: ${sessionDetails.sessionHours}h, Speed: ${sessionDetails.speed}`
      );

      return {
        username,
        password,
        sessionDetails,
        success: true,
      };
    } catch (error) {
      console.error("❌ Error creating MikroTik user:", error);
      throw error;
    } finally {
      conn.close();
    }
  }

  // Check if user exists
  async getUserStatus(resellerId, username) {
    const conn = await this.connect(resellerId);

    try {
      // Check hotspot users
      const users = await conn.write("/ip/hotspot/user/print", [
        `?name=${username}`,
      ]);

      // Check active sessions
      const activeSessions = await conn.write("/ip/hotspot/active/print", [
        `?user=${username}`,
      ]);

      return {
        userExists: users.length > 0,
        isActive: activeSessions.length > 0,
        userInfo: users[0] || null,
        activeSession: activeSessions[0] || null,
      };
    } catch (error) {
      console.error("Error checking user status:", error);
      return { userExists: false, isActive: false };
    } finally {
      conn.close();
    }
  }

  // Disconnect user
  async disconnectUser(resellerId, username) {
    const conn = await this.connect(resellerId);

    try {
      const activeSessions = await conn.write("/ip/hotspot/active/print", [
        `?user=${username}`,
      ]);

      if (activeSessions.length > 0) {
        await conn.write("/ip/hotspot/active/remove", [
          `=numbers=${activeSessions[0][".id"]}`,
        ]);
        console.log(`✅ Disconnected user: ${username}`);
        return { success: true, message: "User disconnected" };
      } else {
        return { success: false, message: "User not active" };
      }
    } catch (error) {
      console.error("Error disconnecting user:", error);
      throw error;
    } finally {
      conn.close();
    }
  }

  // Remove user completely
  async removeUser(resellerId, username) {
    const conn = await this.connect(resellerId);

    try {
      // First disconnect if active
      await this.disconnectUser(resellerId, username);

      // Then remove user
      const users = await conn.write("/ip/hotspot/user/print", [
        `?name=${username}`,
      ]);

      if (users.length > 0) {
        await conn.write("/ip/hotspot/user/remove", [
          `=numbers=${users[0][".id"]}`,
        ]);
        console.log(`✅ Removed user: ${username}`);
        return { success: true, message: "User removed" };
      } else {
        return { success: false, message: "User not found" };
      }
    } catch (error) {
      console.error("Error removing user:", error);
      throw error;
    } finally {
      conn.close();
    }
  }

  // Get router system info
  async getSystemInfo(resellerId) {
    const conn = await this.connect(resellerId);

    try {
      const systemResource = await conn.write("/system/resource/print");
      const identity = await conn.write("/system/identity/print");

      return {
        success: true,
        info: {
          identity: identity[0]?.name || "Unknown",
          uptime: systemResource[0]?.uptime || "Unknown",
          version: systemResource[0]?.version || "Unknown",
          architecture: systemResource[0]?.architecture || "Unknown",
          cpu: systemResource[0]?.cpu || "Unknown",
          memory: systemResource[0]?.["total-memory"] || "Unknown",
          freeMemory: systemResource[0]?.["free-memory"] || "Unknown",
        },
      };
    } catch (error) {
      console.error("Error getting system info:", error);
      return { success: false, error: error.message };
    } finally {
      conn.close();
    }
  }

  // Helper methods
  formatSessionTimeout(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  }

  generatePassword() {
    return Math.random().toString(36).substring(2, 8);
  }

  getRouterConfig(resellerId) {
    return this.routers.get(resellerId);
  }
}

module.exports = new MikrotikService();
