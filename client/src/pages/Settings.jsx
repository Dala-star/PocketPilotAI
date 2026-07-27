import { useContext, useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import { AuthContext } from "../context/AuthContext";

import {
    getProfile,
    updateProfile,
    changePassword as changePasswordService
} from "../services/settings";

function Settings() {

    const { logout } = useContext(AuthContext);

    const [profile, setProfile] = useState({
        name: "",
        email: ""
    });

    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: ""
    });

    const [currency, setCurrency] = useState("GBP");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            const data = await getProfile();

            setProfile({
                name: data.name,
                email: data.email
            });

        } catch (error) {

            console.log(error);

        }

    };

    const saveProfile = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            await updateProfile(profile);

            alert("Profile updated successfully.");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Unable to update profile."
            );

        } finally {

            setLoading(false);

        }

    };

    const updatePassword = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            await changePasswordService(password);

            alert("Password updated successfully.");

            setPassword({
                currentPassword: "",
                newPassword: ""
            });

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.detail ||
                "Unable to change password."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <DashboardLayout>

            <div className="space-y-6">

                <h1 className="text-3xl font-bold">
                    Settings
                </h1>

                {/* Profile */}

                <div className="passbook-card p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Profile
                    </h2>

                    <form
                        onSubmit={saveProfile}
                        className="space-y-4"
                    >

                        <input
                            className="input-field"
                            placeholder="Full Name"
                            value={profile.name}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    name: e.target.value
                                })
                            }
                        />

                        <input
                            className="input-field"
                            type="email"
                            placeholder="Email"
                            value={profile.email}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    email: e.target.value
                                })
                            }
                        />

                        <button
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>

                    </form>

                </div>

                {/* Password */}

                <div className="passbook-card p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Change Password
                    </h2>

                    <form
                        onSubmit={updatePassword}
                        className="space-y-4"
                    >

                        <input
                            className="input-field"
                            type="password"
                            placeholder="Current Password"
                            value={password.currentPassword}
                            onChange={(e) =>
                                setPassword({
                                    ...password,
                                    currentPassword: e.target.value
                                })
                            }
                        />

                        <input
                            className="input-field"
                            type="password"
                            placeholder="New Password"
                            value={password.newPassword}
                            onChange={(e) =>
                                setPassword({
                                    ...password,
                                    newPassword: e.target.value
                                })
                            }
                        />

                        <button
                            disabled={loading}
                            className="btn-secondary"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>

                    </form>

                </div>

                {/* Preferences */}

                <div className="passbook-card p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Preferences
                    </h2>

                    <label className="block text-sm font-medium mb-2 text-ink-soft">
                        Currency
                    </label>

                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="input-field"
                    >
                        <option value="GBP">£ GBP</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                    </select>

                </div>

                {/* Account */}

                <div className="passbook-card p-6">

                    <h2 className="text-xl font-semibold mb-4">
                        Account
                    </h2>

                    <button
                        onClick={logout}
                        className="btn-danger-solid"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </DashboardLayout>

    );

}

export default Settings;
