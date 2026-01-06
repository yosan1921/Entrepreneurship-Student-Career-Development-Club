import React, { useState, useEffect, useCallback } from 'react';
import { systemSettingsAPI } from '../../services/api';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('club_info');
    const [settings, setSettings] = useState([]);
    const [features, setFeatures] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const tabs = [
        { id: 'club_info', label: 'Club Information', icon: '🏢' },
        { id: 'features', label: 'Feature Management', icon: '⚙️' },
        { id: 'system', label: 'System Settings', icon: '🔧' },
        { id: 'permissions', label: 'Roles & Permissions', icon: '👥' }
    ];

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const [settingsResponse, featuresResponse, statsResponse] = await Promise.all([
                systemSettingsAPI.getAllSettings(),
                systemSettingsAPI.getFeatures(),
                systemSettingsAPI.getStats()
            ]);

            if (settingsResponse.data.success) {
                setSettings(settingsResponse.data.data || []);
            }
            if (featuresResponse.data.success) {
                setFeatures(featuresResponse.data.data || []);
            }
            if (statsResponse.data.success) {
                setStats(statsResponse.data.data || {});
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSettingUpdate = async (key, value, description) => {
        try {
            setSaving(true);
            const response = await systemSettingsAPI.updateSetting(key, { value, description });

            if (response.data.success) {
                setSettings(prev => prev.map(setting =>
                    setting.setting_key === key
                        ? { ...setting, setting_value: value.toString(), parsed_value: value }
                        : setting
                ));
                // Optionally show a toast here instead of alert
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            alert('Error updating setting: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleFeatureToggle = async (key, enabled, description) => {
        try {
            setSaving(true);
            const response = await systemSettingsAPI.updateFeature(key, { is_enabled: enabled, description });

            if (response.data.success) {
                setFeatures(prev => prev.map(feature =>
                    feature.feature_key === key
                        ? { ...feature, is_enabled: enabled }
                        : feature
                ));
            }
        } catch (error) {
            console.error('Error updating feature:', error);
            alert('Error updating feature: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (file) => {
        try {
            setUploadingLogo(true);
            const formData = new FormData();
            formData.append('logo', file);

            const response = await systemSettingsAPI.uploadLogo(formData);

            if (response.data.success) {
                setSettings(prev => prev.map(setting =>
                    setting.setting_key === 'club_logo'
                        ? { ...setting, setting_value: response.data.data.logoPath, parsed_value: response.data.data.logoPath }
                        : setting
                ));
                alert('Logo uploaded successfully!');
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            alert('Error uploading logo: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploadingLogo(false);
        }
    };

    const getSettingsByCategory = (category) => {
        return settings.filter(setting => setting.category === category);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-gray-500 mt-1">Configure global application settings</p>
                </div>
                <button
                    onClick={fetchSettings}
                    disabled={loading}
                    className="px-4 py-2.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium text-sm"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Settings', value: stats.totalSettings || 0, icon: '⚙️', color: 'blue' },
                    { label: 'Public Settings', value: stats.publicSettings || 0, icon: '🌍', color: 'green' },
                    { label: 'Total Features', value: stats.totalFeatures || 0, icon: '🎛️', color: 'purple' },
                    { label: 'Enabled Features', value: stats.enabledFeatures || 0, icon: '✅', color: 'orange' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <span className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                {stat.icon}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <span className={`mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="relative min-h-[400px]">
                {activeTab === 'club_info' && (
                    <ClubInfoSettings
                        settings={getSettingsByCategory('club_info')}
                        onUpdate={handleSettingUpdate}
                        onLogoUpload={handleLogoUpload}
                        uploadingLogo={uploadingLogo}
                        saving={saving}
                    />
                )}

                {activeTab === 'features' && (
                    <FeatureManagement
                        features={features}
                        onToggle={handleFeatureToggle}
                        saving={saving}
                    />
                )}

                {activeTab === 'system' && (
                    <SystemSettingsTab
                        settings={getSettingsByCategory('system')}
                        onUpdate={handleSettingUpdate}
                        saving={saving}
                    />
                )}

                {activeTab === 'permissions' && (
                    <RolePermissions />
                )}
            </div>
        </div>
    );
};

// Club Information Settings Component
const ClubInfoSettings = ({ settings, onUpdate, onLogoUpload, uploadingLogo, saving }) => {
    const [formData, setFormData] = useState({});
    const [changedKeys, setChangedKeys] = useState(new Set());

    useEffect(() => {
        const data = {};
        settings.forEach(setting => {
            data[setting.setting_key] = setting.parsed_value || setting.setting_value;
        });
        setFormData(data);
    }, [settings]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setChangedKeys(prev => new Set(prev).add(key));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only update changed fields
        const updates = Array.from(changedKeys).map(key => {
            const originalSetting = settings.find(s => s.setting_key === key);
            return onUpdate(key, formData[key], originalSetting?.description);
        });

        await Promise.all(updates);
        setChangedKeys(new Set());
        alert('Changes saved successfully'); // Simple feedback
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onLogoUpload(file);
        }
    };

    const getCurrentLogo = () => {
        const logoSetting = settings.find(s => s.setting_key === 'club_logo');
        return logoSetting ? logoSetting.parsed_value : '/uploads/logo/default-logo.png';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">General Information</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Club Name</label>
                                <input
                                    type="text"
                                    value={formData.club_name || ''}
                                    onChange={(e) => handleChange('club_name', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.club_description || ''}
                                    onChange={(e) => handleChange('club_description', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Contact Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.club_email || ''}
                                        onChange={(e) => handleChange('club_email', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.club_phone || ''}
                                        onChange={(e) => handleChange('club_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={formData.club_address || ''}
                                        onChange={(e) => handleChange('club_address', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Social Media</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['facebook', 'instagram', 'linkedin', 'twitter'].map(social => (
                                    <div key={social}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{social} URL</label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={formData[`${social}_url`] || ''}
                                                onChange={(e) => handleChange(`${social}_url`, e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder={`https://${social}.com/...`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving || changedKeys.size === 0}
                            className={`px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all ${saving || changedKeys.size === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                }`}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Club Logo</h3>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <div className="relative w-32 h-32 mb-4">
                            <img
                                src={getCurrentLogo()}
                                alt="Current Logo"
                                className="w-full h-full object-contain rounded-lg bg-white shadow-sm p-2"
                                onError={(e) => {
                                    e.target.src = '/uploads/logo/default-logo.png';
                                }}
                            />
                            {uploadingLogo && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            disabled={uploadingLogo}
                            id="logo-upload"
                            className="hidden"
                        />
                        <label
                            htmlFor="logo-upload"
                            className={`w-full py-2.5 bg-white text-blue-600 border border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all text-center cursor-pointer flex items-center justify-center gap-2 ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {uploadingLogo ? 'Uploading...' : 'Upload New Logo'}
                        </label>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            Recommended: 500x500px, PNG/JPG<br />Max size: 5MB
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Ensure your logo has a transparent background for best results on dark and light themes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Feature Management Component
const FeatureManagement = ({ features, onToggle, saving }) => {
    const categories = [...new Set(features.map(f => f.category))];

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-sm text-blue-800">
                    <p className="font-semibold">Feature Control</p>
                    <p>Toggle features to immediately enable or disable them across the application. Disabling a feature will hide it from all users.</p>
                </div>
            </div>

            {categories.map(category => (
                <div key={category} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 capitalize border-b pb-2 border-gray-200">
                        {category} Features
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {features
                            .filter(feature => feature.category === category)
                            .map(feature => (
                                <div key={feature.feature_key} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{feature.feature_name}</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed min-h-[2.5em]">
                                                {feature.description}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={feature.is_enabled}
                                                    onChange={(e) => onToggle(feature.feature_key, e.target.checked, feature.description)}
                                                    disabled={saving}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${feature.is_enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className={`text-xs font-medium ${feature.is_enabled ? 'text-green-700' : 'text-gray-500'}`}>
                                            {feature.is_enabled ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

// System Settings Tab Component
const SystemSettingsTab = ({ settings, onUpdate, saving }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const data = {};
        settings.forEach(setting => {
            data[setting.setting_key] = setting.parsed_value;
        });
        setFormData(data);
    }, [settings]);

    const handleChange = async (key, value) => {
        // Immediate update for toggles to feel responsive, or use state and save button
        setFormData(prev => ({ ...prev, [key]: value }));

        const originalSetting = settings.find(s => s.setting_key === key);
        if (originalSetting) {
            await onUpdate(key, value, originalSetting.description);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Application Configuration</h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {/* Maintenance Mode */}
                    <div className="p-6 flex items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">Maintenance Mode</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Temporarily disable access to the public site for maintenance. Admins can still log in.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.maintenance_mode || false}
                                onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                                disabled={saving}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                    </div>

                    {/* Registration Open */}
                    <div className="p-6 flex items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">Registration Status</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Allow new users to sign up for accounts. Disable to close registration.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.registration_open || false}
                                onChange={(e) => handleChange('registration_open', e.target.checked)}
                                disabled={saving}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    {/* File Upload Size */}
                    <div className="p-6 flex items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">Max Upload Size</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Maximum allowed file size for user uploads (in Megabytes).
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={formData.max_file_size || 50}
                                onChange={(e) => handleChange('max_file_size', parseInt(e.target.value))}
                                className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-right"
                                min="1"
                                max="100"
                            />
                            <span className="text-gray-500 font-medium">MB</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Role Permissions Component
const RolePermissions = () => {
    const roles = [
        {
            name: 'Super Admin',
            key: 'super_admin',
            color: 'purple',
            description: 'Full system access and control',
            permissions: [
                'Manage all users and roles',
                'Access system settings',
                'Manage all content',
                'View all reports and analytics',
                'Database management'
            ]
        },
        {
            name: 'Admin',
            key: 'admin',
            color: 'blue',
            description: 'Administrative access with some restrictions',
            permissions: [
                'Manage members and events',
                'Manage content (gallery, resources)',
                'View reports and analytics',
                'Manage announcements',
                'Access most admin features'
            ]
        },
        {
            name: 'Editor',
            key: 'editor',
            color: 'green',
            description: 'Content management access',
            permissions: [
                'Manage events and news',
                'Upload to gallery',
                'Manage resources',
                'Create announcements',
                'Basic content management'
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
                <h3 className="text-lg font-bold text-gray-900">Role Definitions</h3>
                <p className="text-gray-500">
                    View the permissions assigned to each system role. Role modification requires Root access.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className={`px-6 py-4 bg-${role.color}-50 border-b border-${role.color}-100`}>
                            <h4 className={`text-lg font-bold text-${role.color}-700`}>{role.name}</h4>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-white text-${role.color}-600 border border-${role.color}-200`}>
                                {role.key}
                            </span>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <p className="text-sm text-gray-600 mb-6 italic min-h-[40px]">{role.description}</p>

                            <div className="mt-auto">
                                <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Capabilities</h5>
                                <ul className="space-y-2">
                                    {role.permissions.map((permission, index) => (
                                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            {permission}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemSettings;