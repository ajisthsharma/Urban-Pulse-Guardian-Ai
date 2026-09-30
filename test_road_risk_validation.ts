import { buildRoadRiskIntelligence } from "./src/services/roadRiskIntelligence";
import { Report } from "./src/types";

function runValidationTests() {
  console.log("=== STRICT TECHNICAL VALIDATION: ROAD RISK INTELLIGENCE ENGINE ===");

  const now = new Date();
  const minutesAgo = (min: number) => new Date(now.getTime() - min * 60 * 1000).toISOString();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || "Condition not met"}`);
    }
  }

  // TEST A: One isolated report
  {
    const reports: any[] = [{
      id: "REP-A1",
      title: "Isolated small pothole",
      category: "Pothole",
      severity: 45,
      latitude: 28.6139,
      longitude: 77.2090,
      location: "Ring Road Sector 12",
      status: "Reported",
      source: "MANUAL_REPORT",
      reporterEmail: "user1@delhi.gov",
      createdAt: minutesAgo(30)
    }];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 1, "Test A: Exactly 1 zone created");
    assert(zones[0].corroborationState === "EMERGING / LOW EVIDENCE", "Test A: Identified as Emerging / Low Evidence");
    assert(zones[0].riskScore < 50, `Test A: Score is bounded (${zones[0].riskScore} < 50)`);
  }

  // TEST B: Multiple reports on same location
  {
    const reports: any[] = [
      {
        id: "REP-B1",
        title: "Deep pothole hit 1",
        category: "Pothole",
        severity: 70,
        latitude: 28.61390,
        longitude: 77.20900,
        location: "Outer Ring Road",
        status: "Reported",
        source: "ROAD_SCANNER",
        createdAt: minutesAgo(40)
      },
      {
        id: "REP-B2",
        title: "Deep pothole hit 2",
        category: "Pothole",
        severity: 75,
        latitude: 28.61392,
        longitude: 77.20901,
        location: "Outer Ring Road",
        status: "In Progress",
        source: "ROAD_SCANNER",
        createdAt: minutesAgo(10)
      },
      {
        id: "REP-B3",
        title: "Deep pothole hit 3",
        category: "Pothole",
        severity: 80,
        latitude: 28.61391,
        longitude: 77.20902,
        location: "Outer Ring Road",
        status: "Reported",
        source: "ROAD_SCANNER",
        createdAt: minutesAgo(5)
      }
    ];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 1, "Test B: Grouped into single hotspot zone");
    assert(zones[0].corroborationState === "PERSISTENT OBSERVATION", "Test B: Identified as Persistent Observation");
    assert(zones[0].factors.persistenceScore >= 8, `Test B: Persistence bonus applied (${zones[0].factors.persistenceScore} >= 8)`);
  }

  // TEST C: AI + citizen report near same location
  {
    const reports: any[] = [
      {
        id: "REP-C1",
        title: "AI Camera detected large crater",
        category: "Pothole",
        severity: 85,
        latitude: 28.5355,
        longitude: 77.3910,
        location: "Noida Expressway Sector 128",
        status: "Reported",
        source: "ROAD_SCANNER",
        reporterEmail: "scanner-fleet-04@urbanpulse.ai",
        createdAt: minutesAgo(60)
      },
      {
        id: "REP-C2",
        title: "Citizen reported broken tire crater",
        category: "Pothole",
        severity: 90,
        latitude: 28.5358, // ~35m away
        longitude: 77.3912,
        location: "Noida Expressway Sector 128",
        status: "Reported",
        source: "MANUAL_REPORT",
        reporterEmail: "commuter_rajesh@gmail.com",
        createdAt: minutesAgo(15) // independent, 45 min apart
      }
    ];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 1, "Test C: Merged into single corridor");
    assert(zones[0].corroborationState === "MULTI-SOURCE CORROBORATED", "Test C: Genuinely Multi-Source Corroborated");
    assert(zones[0].factors.corroborationScore === 15, "Test C: Full 15 pts corroboration bonus awarded");
  }

  // TEST D: AI + citizen reports on different nearby roads (text contradiction)
  {
    const reports: any[] = [
      {
        id: "REP-D1",
        title: "Water accumulation Sector 14",
        category: "Waterlogging",
        severity: 70,
        latitude: 28.4500,
        longitude: 77.0500,
        location: "Sector 14 Main Road",
        status: "Reported",
        source: "ROAD_SCANNER",
        createdAt: minutesAgo(20)
      },
      {
        id: "REP-D2",
        title: "Water accumulation Sector 29",
        category: "Waterlogging",
        severity: 70,
        latitude: 28.4508, // ~100m away geometrically
        longitude: 77.0508,
        location: "Sector 29 Leisure Valley", // Explicitly conflicting sector tokens!
        status: "Reported",
        source: "MANUAL_REPORT",
        createdAt: minutesAgo(25)
      }
    ];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 2, `Test D: Correctly separated conflicting sectors into 2 zones (got ${zones.length})`);
  }

  // TEST E: Multiple resolved reports (organic recalculation, no arbitrary 80% hack)
  {
    const reports: any[] = [
      {
        id: "REP-E1",
        title: "Repaired pothole A",
        category: "Pothole",
        severity: 80,
        latitude: 28.6000,
        longitude: 77.2000,
        location: "MG Road",
        status: "Resolved",
        source: "MANUAL_REPORT",
        createdAt: daysAgo(5)
      },
      {
        id: "REP-E2",
        title: "Repaired pothole B",
        category: "Pothole",
        severity: 85,
        latitude: 28.6002,
        longitude: 77.2002,
        location: "MG Road",
        status: "Resolved",
        source: "ROAD_SCANNER",
        createdAt: daysAgo(3)
      }
    ];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 1, "Test E: 1 zone created");
    assert(zones[0].activeReportsCount === 0, "Test E: 0 active reports");
    assert(zones[0].factors.severityScore === 0, "Test E: Active severity score is organically 0");
    assert(zones[0].factors.activeIncidentsScore === 0, "Test E: Active density score is organically 0");
    assert(zones[0].factors.recencyScore === 0, "Test E: Recency score is organically 0");
    assert(zones[0].riskScore <= 10, `Test E: Residual risk score is low (${zones[0].riskScore} <= 10)`);
    assert(zones[0].riskLevel === "LOW", "Test E: Risk level is LOW");
    assert(zones[0].corroborationState === "REMEDIATED ZONE", "Test E: State marked REMEDIATED ZONE");
  }

  // TEST F: Old unresolved report (> 14 days)
  {
    const reports: any[] = [{
      id: "REP-F1",
      title: "Forgotten sign hazard",
      category: "Road Hazards",
      severity: 60,
      latitude: 28.7000,
      longitude: 77.1000,
      location: "Old GT Road",
      status: "Reported",
      source: "MANUAL_REPORT",
      createdAt: daysAgo(20) // 20 days ago (> 336 hours)
    }];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 1, "Test F: 1 zone created");
    assert(zones[0].corroborationState === "STALE HAZARD RECORD", `Test F: Identified as STALE HAZARD RECORD (got ${zones[0].corroborationState})`);
    assert(zones[0].factors.recencyScore === 0, "Test F: Recency factor decayed to 0 pts");
  }

  // TEST G: High-severity recent incident
  {
    const reports: any[] = [{
      id: "REP-G1",
      title: "Severe Road Cave-In",
      category: "Road Hazards",
      severity: 95,
      latitude: 28.6300,
      longitude: 77.2200,
      location: "Connaught Place Inner Circle",
      status: "Reported",
      source: "MANUAL_REPORT",
      createdAt: minutesAgo(10)
    }];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 1, "Test G: 1 zone created");
    assert(zones[0].factors.severityScore >= 25, `Test G: High severity captured (${zones[0].factors.severityScore} >= 25)`);
    assert(zones[0].factors.recencyScore === 15, "Test G: Maximum recency score awarded for 10-minute old event");
  }

  // TEST H: Invalid 0,0 coordinates
  {
    const reports: any[] = [
      {
        id: "REP-H1",
        title: "Corrupt GPS 0,0",
        category: "Pothole",
        severity: 80,
        latitude: 0,
        longitude: 0,
        location: "Null Island",
        status: "Reported",
        createdAt: minutesAgo(10)
      },
      {
        id: "REP-H2",
        title: "NaN GPS",
        category: "Pothole",
        severity: 80,
        latitude: NaN,
        longitude: 77.20,
        location: "Unknown",
        status: "Reported",
        createdAt: minutesAgo(10)
      }
    ];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 0, `Test H: Invalid coordinates discarded completely (got ${zones.length} zones)`);
  }

  // TEST I: Duplicate Road Scanner writes (<5s apart, same coordinates)
  {
    const reports: any[] = [
      {
        id: "REP-I1",
        title: "Pothole Dashcam Frame 1",
        category: "Pothole",
        severity: 70,
        latitude: 28.50000,
        longitude: 77.10000,
        location: "Vasant Kunj Marg",
        status: "Reported",
        source: "ROAD_SCANNER",
        reporterEmail: "scanner-unit-1@urbanpulse.ai",
        createdAt: "2026-09-30T00:00:00.000Z"
      },
      {
        id: "REP-I2",
        title: "Pothole Dashcam Frame 2 (Rapid Write)",
        category: "Pothole",
        severity: 70,
        latitude: 28.50000,
        longitude: 77.10000,
        location: "Vasant Kunj Marg",
        status: "Reported",
        source: "ROAD_SCANNER",
        reporterEmail: "scanner-unit-1@urbanpulse.ai",
        createdAt: "2026-09-30T00:00:02.000Z" // only 2 seconds apart, same scanner
      }
    ];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 1, "Test I: Grouped into single zone");
    assert(zones[0].corroborationState !== "MULTI-SOURCE CORROBORATED", "Test I: Duplicate write NOT falsely labeled multi-source");
    assert(zones[0].corroborationState === "AI OBSERVED" || zones[0].corroborationState === "PERSISTENT OBSERVATION", "Test I: Accurately labeled AI OBSERVED / PERSISTENT");
  }

  // TEST J: Parallel roads within 250m
  {
    // Two roads 110m apart, but one is "Barakhamba Road" and one is "Tolstoy Marg" with incompatible categories
    const reports: any[] = [
      {
        id: "REP-J1",
        title: "Streetlight outage Barakhamba Road",
        category: "Streetlight",
        severity: 60,
        latitude: 28.6280,
        longitude: 77.2250,
        location: "Barakhamba Road Ward 1",
        status: "Reported",
        source: "MANUAL_REPORT",
        createdAt: minutesAgo(20)
      },
      {
        id: "REP-J2",
        title: "Deep Pothole Tolstoy Marg",
        category: "Pothole", // Different incompatible category + distinct corridor name
        severity: 80,
        latitude: 28.6288, // ~100m away (less than 250m)
        longitude: 77.2250,
        location: "Tolstoy Marg Ward 7",
        status: "Reported",
        source: "MANUAL_REPORT",
        createdAt: minutesAgo(25)
      }
    ];

    const zones = buildRoadRiskIntelligence(reports);
    assert(zones.length === 2, `Test J: Parallel/intersecting roads separated into 2 distinct zones (got ${zones.length})`);
  }

  console.log(`\n=== RESULTS: ${passedTests} / ${totalTests} TESTS PASSED ===\n`);
  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runValidationTests();
