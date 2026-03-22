import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export interface CompressedImage {
  uri: string;
  type: string;
  name: string;
}

async function ensureMediaLibraryPermission(): Promise<boolean> {
  let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  }
  return permission.granted;
}

export async function pickAndCompressImage(): Promise<CompressedImage | null> {
  if (!(await ensureMediaLibraryPermission())) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];

  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 512 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return {
    uri: manipulated.uri,
    type: "image/jpeg",
    name: `profile_${Date.now()}.jpg`,
  };
}

export async function pickQuestionImages(
  maxCount: number = 5
): Promise<CompressedImage[]> {
  if (!(await ensureMediaLibraryPermission())) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: 0.8,
  });

  if (result.canceled) return [];

  const compressed = await Promise.all(
    result.assets.map(async (asset, index) => {
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return {
        uri: manipulated.uri,
        type: "image/jpeg",
        name: `question_${Date.now()}_${index}.jpg`,
      };
    })
  );

  return compressed;
}
