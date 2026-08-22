-- PomoMate — Supabase Storage buckets

-- Avatar images (1:1 aspect ratio)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Room assets (files, PDFs, images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-assets', 'room-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Storage policies for room assets
CREATE POLICY "Room members can upload room assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'room-assets'
    AND EXISTS (
      SELECT 1 FROM room_members
      WHERE room_id = (storage.foldername(name))[1]::uuid
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can view room assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'room-assets'
    AND EXISTS (
      SELECT 1 FROM room_members
      WHERE room_id = (storage.foldername(name))[1]::uuid
        AND user_id = auth.uid()
    )
  );
