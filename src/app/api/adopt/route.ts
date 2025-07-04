import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { projectId, creatorId, adopterId } = await req.json();
    if (!projectId || !creatorId || !adopterId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Fetch creator profile
    const { data: creatorProfile, error: creatorError } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", creatorId)
      .single();
    if (creatorError || !creatorProfile?.email) {
      return NextResponse.json(
        { error: "Creator not found or missing email" },
        { status: 404 }
      );
    }
    // Fetch adopter profile
    const { data: adopterProfile, error: adopterError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", adopterId)
      .single();
    if (adopterError) {
      return NextResponse.json({ error: "Adopter not found" }, { status: 404 });
    }
    // Fetch project title
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("title")
      .eq("id", projectId)
      .single();
    if (projectError) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    // Placeholder for sending email
    console.log(
      `Send email to ${creatorProfile.email}:\n` +
        `Subject: Your project '${project.title}' has been adopted!\n` +
        `Body: Hello ${creatorProfile.name || ""},\n\n` +
        `Your project '${project.title}' has been adopted by ${
          adopterProfile.name || "a user"
        } (${adopterProfile.email || "no email"}).\n` +
        `You can now connect and collaborate!\n\nInspiralor Team`
    );
    // Respond success
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
