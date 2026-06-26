"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/lib/store/features/authSlice";
import { getMediaUrl } from "@/app/utils/getAssetsUrl";

const MyProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState({
    name: "",
    designation: "",
    experience: 0,
    shortBio: "",
    skills: [{ name: "", expertise: 0 }],
    location: { country: "", state: "", city: "", address: "" },
    social: { facebook: "", linkedin: "", twitter: "", instagram: "" },
    profileImage: null,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        designation: user.designation || "",
        experience: user.experience || 0,
        shortBio: user.shortBio || "",
        skills:
          user.skills && user.skills.length > 0
            ? user.skills
            : [{ name: "", expertise: 0 }],
        location: user.location || {
          country: "",
          state: "",
          city: "",
          address: "",
        },
        social: user.social || {
          facebook: "",
          linkedin: "",
          twitter: "",
          instagram: "",
        },
        profileImage: user.profileImage || null,
      });
    }
  }, [user]);

  const handleChange = (field, value) =>
    setProfile({ ...profile, [field]: value });

  const handleLocationChange = (field, value) =>
    setProfile({
      ...profile,
      location: { ...profile.location, [field]: value },
    });

  const handleSocialChange = (field, value) =>
    setProfile({ ...profile, social: { ...profile.social, [field]: value } });

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...profile.skills];
    newSkills[index][field] = value;
    setProfile({ ...profile, skills: newSkills });
  };

  const addSkill = () =>
    setProfile({
      ...profile,
      skills: [...profile.skills, { name: "", expertise: 0 }],
    });

  const removeSkill = (index) => {
    const newSkills = profile.skills.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      skills: newSkills.length ? newSkills : [{ name: "", expertise: 0 }],
    });
  };

  const handleSave = () => {
    dispatch(updateUserProfile(profile)).unwrap();
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-800">My Profile</h1>

      {/* Name + Profile Picture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Name</Label>
          <Input
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        {/* Profile Picture */}
        <div>
          <Label>Profile Picture</Label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setProfile({ ...profile, profileImage: e.target.files[0] })
            }
            className="mt-2"
          />

          {/* Preview: if file uploaded or existing URL */}
          {profile.profileImage && typeof profile.profileImage === "string" ? (
            <img
              src={getMediaUrl(profile.profileImage)}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full mt-2 object-cover"
            />
          ) : profile.profileImage instanceof File ? (
            <img
              src={URL.createObjectURL(profile.profileImage)}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full mt-2 object-cover"
            />
          ) : null}
        </div>

        <div>
          <Label>Designation</Label>
          <Input
            value={profile.designation}
            onChange={(e) => handleChange("designation", e.target.value)}
          />
        </div>

        <div>
          <Label>Experience (years)</Label>
          <Input
            type="number"
            value={profile.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
          />
        </div>
      </div>

      {/* Short Bio */}
      <div>
        <Label>Short Bio</Label>
        <Textarea
          value={profile.shortBio}
          onChange={(e) => handleChange("shortBio", e.target.value)}
          rows={4}
        />
      </div>

      {/* Skills */}
      <div>
        <Label>Skills & Expertise</Label>
        <div className="space-y-3 mt-2">
          {profile.skills.map((skill, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
            >
              <Input
                placeholder="Skill Name"
                value={skill.name}
                onChange={(e) =>
                  handleSkillChange(index, "name", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="% Expertise"
                value={skill.expertise}
                onChange={(e) =>
                  handleSkillChange(index, "expertise", e.target.value)
                }
              />
              <Button
                onClick={() => removeSkill(index)}
                size="sm"
                variant="destructive"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={addSkill} size="sm">
            Add Skill
          </Button>
        </div>
      </div>

      {/* Location */}
      <div>
        <Label>Location</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Input
            placeholder="Country"
            value={profile.location.country}
            onChange={(e) => handleLocationChange("country", e.target.value)}
          />
          <Input
            placeholder="State"
            value={profile.location.state}
            onChange={(e) => handleLocationChange("state", e.target.value)}
          />
          <Input
            placeholder="City"
            value={profile.location.city}
            onChange={(e) => handleLocationChange("city", e.target.value)}
          />
          <Input
            placeholder="Address"
            value={profile.location.address}
            onChange={(e) => handleLocationChange("address", e.target.value)}
          />
        </div>
      </div>

      {/* Social Media */}
      <div>
        <Label>Social Media</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Input
            placeholder="Facebook"
            value={profile.social.facebook}
            onChange={(e) => handleSocialChange("facebook", e.target.value)}
          />
          <Input
            placeholder="LinkedIn"
            value={profile.social.linkedin}
            onChange={(e) => handleSocialChange("linkedin", e.target.value)}
          />
          <Input
            placeholder="Twitter"
            value={profile.social.twitter}
            onChange={(e) => handleSocialChange("twitter", e.target.value)}
          />
          <Input
            placeholder="Instagram"
            value={profile.social.instagram}
            onChange={(e) => handleSocialChange("instagram", e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        onClick={handleSave}
        className="w-full md:w-auto mt-4"
      >
        Update Now
      </Button>
    </div>
  );
};

export default MyProfile;
