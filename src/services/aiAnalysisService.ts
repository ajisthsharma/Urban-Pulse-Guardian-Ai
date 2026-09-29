import { GoogleGenAI } from "@google/genai";

export interface AIAnalysisResponse {
  issueDetected: boolean;
  issueType: "Pothole" | "Garbage Overflow" | "Broken Streetlight" | "Road Obstruction" | "Vandals / Graffiti" | "Other";
  confidence: number;
  severity: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  riskLevel: "Low" | "Medium" | "High";
  description: string;
  recommendedActions: string[];
  reasoning: string;
  source: "AI_GEMINI" | "MANUAL_USER";
}

/**
 * Validates whether the Gemini response schema conforms to our domain types.
 */
export function validateAIAnalysisOutput(data: any): { valid: boolean; result?: AIAnalysisResponse; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "AI analysis output is invalid or unavailable." };
  }

  const issueDetected = data.issueDetected !== undefined ? Boolean(data.issueDetected) : true;
  
  const validCategories = ["Pothole", "Garbage Overflow", "Broken Streetlight", "Road Obstruction", "Vandals / Graffiti", "Other"];
  let issueType = data.issueType || data.category || (issueDetected ? "Other" : "Other");
  if (issueDetected) {
    if (!validCategories.includes(issueType)) {
      const lower = String(issueType).toLowerCase();
      if (lower.includes("pothole") || lower.includes("crack") || lower.includes("asphalt")) issueType = "Pothole";
      else if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste")) issueType = "Garbage Overflow";
      else if (lower.includes("light") || lower.includes("lamp") || lower.includes("dark")) issueType = "Broken Streetlight";
      else if (lower.includes("obstruction") || lower.includes("block") || lower.includes("barrier")) issueType = "Road Obstruction";
      else if (lower.includes("graffiti") || lower.includes("vandal")) issueType = "Vandals / Graffiti";
      else issueType = "Other";
    }
  } else {
    issueType = "Other";
  }

  const rawConf = data.confidence;
  const rawSev = data.severity ?? data.severityScore;

  if (issueDetected) {
    if (rawConf === undefined || rawConf === null || isNaN(Number(rawConf))) {
      return { valid: false, error: "AI response is missing required numerical confidence score." };
    }
    if (rawSev === undefined || rawSev === null || isNaN(Number(rawSev))) {
      return { valid: false, error: "AI response is missing required numerical severity score." };
    }
  }

  const confidence = issueDetected 
    ? Math.max(0, Math.min(100, Math.round(Number(rawConf))))
    : 0;

  const severity = issueDetected 
    ? Math.max(0, Math.min(100, Math.round(Number(rawSev))))
    : 0;

  let riskLevel: "Low" | "Medium" | "High" = "Low";
  if (issueDetected) {
    if (data.riskLevel === "Low" || data.riskLevel === "Medium" || data.riskLevel === "High") {
      riskLevel = data.riskLevel;
    } else {
      riskLevel = severity >= 75 ? "High" : severity >= 45 ? "Medium" : "Low";
    }
  }

  let priority: "Low" | "Medium" | "High" | "Critical" = "Low";
  if (issueDetected) {
    if (data.priority === "Low" || data.priority === "Medium" || data.priority === "High" || data.priority === "Critical") {
      priority = data.priority;
    } else {
      priority = severity >= 85 ? "Critical" : severity >= 70 ? "High" : severity >= 40 ? "Medium" : "Low";
    }
  }

  const description = typeof data.description === "string" && data.description.trim() 
    ? data.description.trim() 
    : "Identified urban infrastructure hazard requiring crew remediation.";

  const recommendedActions = Array.isArray(data.recommendedActions) 
    ? data.recommendedActions.filter((a: any) => typeof a === "string" && a.trim())
    : ["Deploy field assessment team", "Verify location & road clearance"];

  const reasoning = typeof data.reasoning === "string" && data.reasoning.trim()
    ? data.reasoning.trim()
    : "Visual inspection confirms physical structural condition.";

  return {
    valid: true,
    result: {
      issueDetected,
      issueType: issueType as any,
      confidence,
      severity,
      priority,
      riskLevel,
      description,
      recommendedActions,
      reasoning,
      source: "AI_GEMINI"
    }
  };
}

