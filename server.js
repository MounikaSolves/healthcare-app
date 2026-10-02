const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./supabase");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Healthcare backend is running");
});

app.get("/patients", async (req, res) => {
    const { data, error } = await supabase
        .from("patients")
        .select("*");

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});
app.post("/patients", async (req, res) => {
    const { profile_id, date_of_birth, gender, address } = req.body;

    const { data, error } = await supabase
        .from("patients")
        .insert([
            {
                profile_id: profile_id,
                date_of_birth: date_of_birth,
                gender: gender,
                address: address
            }
        ])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});
app.get("/profiles", async (req, res) => {
    const { data, error } = await supabase
        .from("profile")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
});
app.put("/patients/:id", async (req, res) => {
    const { id } = req.params;
    const { date_of_birth, gender, address, emergency_contact } = req.body;

    const { data, error } = await supabase
        .from("patients")
        .update({
            date_of_birth: date_of_birth,
            gender: gender,
            address: address,
            emergency_contact: emergency_contact
        })
        .eq("id", id)
        .select("*");
    console.log("UPDATE DATA:", data);
    console.log("UPDATE ERROR:", error);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});
app.delete("/patients/:id", async (req, res) => {
    const { id } = req.params;

    console.log("ID received:", id);

    const { data, error } = await supabase
        .from("patients")
        .delete()
        .eq("id", id)
        .select();

    console.log("Deleted data:", data);
    console.log("Error:", error);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({
            message: "Patient not found or could not be deleted"
        });
    }

    res.json({
        message: "Patient deleted successfully",
        patient: data[0]
    });
});
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Login using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        return res.status(401).json({
            error: error.message
        });
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError) {
        return res.status(500).json({
            error: profileError.message
        });
    }
    if (!profile) {
    return res.status(404).json({
        error: "Profile not found for this user"
    });
}

    res.json({
        message: "Login successful",
        user: data.user,
        profile: profile
    });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});