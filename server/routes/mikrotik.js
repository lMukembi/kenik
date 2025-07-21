const express = require("express");
const router = express.Router();
const { RouterOSAPI } = require("node-routeros");

// Direct connection test (bypassing the service temporarily)
router.post("/test-connection", async (req, res) => {
  try {
    const { ip, username, password } = req.body;

    // Validate input
    if (!ip || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "❌ Missing required fields",
        error: "IP, username, and password are required",
      });
    }

    console.log(`🔌 Testing connection to ${ip}:8728 with user ${username}`);

    // Create direct connection (bypassing the service for testing)
    const conn = new RouterOSAPI({
      host: ip,
      user: username,
      password: password,
      port: 8728,
      timeout: 5000,
    });

    try {
      // Test connection
      await conn.connect();
      console.log("✅ Connected to MikroTik successfully");

      // Get system info
      const systemResource = await conn.write("/system/resource/print");
      const identity = await conn.write("/system/identity/print");

      // Close connection
      conn.close();

      res.json({
        success: true,
        message: "✅ MikroTik connection successful!",
        info: {
          identity: identity[0]?.name || "Unknown",
          uptime: systemResource[0]?.uptime || "Unknown",
          version: systemResource[0]?.version || "Unknown",
          architecture: systemResource[0]?.architecture || "Unknown",
          cpu: systemResource[0]?.cpu || "Unknown",
          totalMemory: systemResource[0]?.["total-memory"] || "Unknown",
          freeMemory: systemResource[0]?.["free-memory"] || "Unknown",
        },
      });
    } catch (connectionError) {
      console.error("❌ Connection failed:", connectionError.message);

      res.status(500).json({
        success: false,
        message: "❌ MikroTik connection failed",
        error: connectionError.message,
        troubleshooting: {
          commonCauses: [
            "API service not enabled on MikroTik (/ip service enable api)",
            "Firewall blocking port 8728",
            "Wrong IP address or credentials",
            "Network connectivity issues",
          ],
        },
      });
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    res.status(500).json({
      success: false,
      message: "❌ Connection test failed",
      error: error.message,
    });
  }
});

// Test user creation
router.post("/test-create-user", async (req, res) => {
  try {
    const { ip, username, password, testAmount } = req.body;

    if (!ip || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "❌ Missing required fields",
      });
    }

    console.log(`🧪 Testing user creation on ${ip}`);

    // Create direct connection
    const conn = new RouterOSAPI({
      host: ip,
      user: username,
      password: password,
      port: 8728,
      timeout: 5000,
    });

    try {
      await conn.connect();

      // Generate test user details
      const testUsername = `test_${Date.now()}`;
      const testPassword = Math.random().toString(36).substring(2, 8);
      const amount = testAmount || 50;

      // Calculate session details (simplified for testing)
      const sessionHours = amount / 10; // KSh 10 per hour for testing
      const sessionMinutes = Math.floor(sessionHours * 60);
      const sessionTimeout =
        sessionMinutes < 60
          ? `${sessionMinutes}m`
          : `${Math.floor(sessionMinutes / 60)}h${sessionMinutes % 60}m`;

      // Create user command
      const createCommand = [
        "/ip/hotspot/user/add",
        `=name=${testUsername}`,
        `=password=${testPassword}`,
        `=profile=default`,
        `=limit-uptime=${sessionTimeout}`,
        `=comment=Test user - Amount: KSh${amount} - ${new Date().toISOString()}`,
      ];

      console.log("📝 Creating user with command:", createCommand);

      await conn.write(createCommand);

      // Verify user was created
      const createdUsers = await conn.write("/ip/hotspot/user/print", [
        `?name=${testUsername}`,
      ]);

      conn.close();

      res.json({
        success: true,
        message: "✅ Test user created successfully!",
        user: {
          username: testUsername,
          password: testPassword,
          amount: amount,
          sessionTimeout: sessionTimeout,
          created: createdUsers.length > 0,
        },
      });
    } catch (userError) {
      console.error("❌ User creation failed:", userError.message);
      res.status(500).json({
        success: false,
        message: "❌ Test user creation failed",
        error: userError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Test failed",
      error: error.message,
    });
  }
});

// Test active users
router.post("/test-active-users", async (req, res) => {
  try {
    const { ip, username, password } = req.body;

    const conn = new RouterOSAPI({
      host: ip,
      user: username,
      password: password,
      port: 8728,
      timeout: 5000,
    });

    try {
      await conn.connect();

      const activeUsers = await conn.write("/ip/hotspot/active/print");
      const allUsers = await conn.write("/ip/hotspot/user/print");

      conn.close();

      res.json({
        success: true,
        message: "✅ Successfully retrieved user data",
        data: {
          activeUsers: activeUsers || [],
          totalUsers: allUsers || [],
          counts: {
            active: (activeUsers || []).length,
            total: (allUsers || []).length,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "❌ Failed to get users",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Test failed",
      error: error.message,
    });
  }
});

// Test MikroTik service registration
router.post("/test-service", async (req, res) => {
  try {
    const { ip, username, password } = req.body;
    const mikrotikService = require("../services/mikrotikService");

    // Test the actual service
    mikrotikService.registerRouter("test-reseller", {
      ip: ip,
      username: username,
      password: password,
      port: 8728,
    });

    console.log("🔧 Router registered in service");

    // Test the service method
    const systemInfo = await mikrotikService.getSystemInfo("test-reseller");

    res.json({
      success: true,
      message: "✅ MikroTik service working correctly!",
      info: systemInfo,
    });
  } catch (error) {
    console.error("❌ Service test failed:", error.message);
    res.status(500).json({
      success: false,
      message: "❌ MikroTik service test failed",
      error: error.message,
    });
  }
});

module.exports = router;
