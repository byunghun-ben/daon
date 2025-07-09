-- Create notifications tables for push notification system

-- Push tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Unique constraint to prevent duplicate tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_tokens_unique ON push_tokens(user_id, token);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    categories JSONB DEFAULT '{
        "feeding": {"enabled": true, "sound": true, "vibration": true, "badge": true},
        "sleep": {"enabled": true, "sound": true, "vibration": true, "badge": true},
        "diaper": {"enabled": true, "sound": false, "vibration": true, "badge": true},
        "growth": {"enabled": true, "sound": false, "vibration": false, "badge": true},
        "milestone": {"enabled": true, "sound": true, "vibration": true, "badge": true},
        "summary": {"enabled": true, "sound": false, "vibration": false, "badge": true},
        "reminder": {"enabled": true, "sound": true, "vibration": true, "badge": true}
    }'::jsonb,
    quiet_hours JSONB DEFAULT '{
        "enabled": false,
        "startTime": "22:00",
        "endTime": "07:00"
    }'::jsonb,
    frequency JSONB DEFAULT '{
        "feeding": 3,
        "sleep": 2,
        "dailySummary": "20:00",
        "weeklyReport": 0
    }'::jsonb,
    language TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en', 'ja')),
    timezone TEXT DEFAULT 'Asia/Seoul',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Unique constraint for user settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Scheduled notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('feeding', 'sleep', 'diaper', 'growth', 'milestone', 'summary', 'reminder')),
    template_key TEXT NOT NULL,
    template_data JSONB DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    expo_ticket_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for scheduled notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_id ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_child_id ON scheduled_notifications(child_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_category ON scheduled_notifications(category);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_at ON scheduled_notifications(scheduled_at);

-- Notification history table
CREATE TABLE IF NOT EXISTS notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('delivered', 'failed', 'receipt_error')),
    expo_ticket_id TEXT,
    expo_receipt_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for notification history
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_child_id ON notification_history(child_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_category ON notification_history(category);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_push_tokens_updated_at BEFORE UPDATE ON push_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_notifications_updated_at BEFORE UPDATE ON scheduled_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Push tokens policies
CREATE POLICY "Users can view their own push tokens" ON push_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens" ON push_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens" ON push_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens" ON push_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can view their own notification settings" ON notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Scheduled notifications policies
CREATE POLICY "Users can view their own scheduled notifications" ON scheduled_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage all scheduled notifications" ON scheduled_notifications
    FOR ALL USING (current_setting('role') = 'service_role');

-- Notification history policies
CREATE POLICY "Users can view their own notification history" ON notification_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notification history" ON notification_history
    FOR INSERT WITH CHECK (current_setting('role') = 'service_role');