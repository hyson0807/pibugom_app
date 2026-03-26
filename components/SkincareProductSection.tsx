import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface Props {
  label: string;
  products: string[];
  onAdd: (name: string) => void;
  onRemove: (index: number) => void;
}

export default function SkincareProductSection({
  label,
  products,
  onAdd,
  onRemove,
}: Props) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput("");
  };

  return (
    <View className="mb-5">
      <Text className="text-sm font-medium text-skin-text mb-2">{label}</Text>

      {products.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {products.map((name, i) => (
            <View
              key={i}
              className="flex-row items-center bg-skin-surface border border-skin-border rounded-full px-3 py-1.5"
            >
              <Text className="text-sm text-skin-text mr-1">{name}</Text>
              <TouchableOpacity onPress={() => onRemove(i)} hitSlop={6}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={Colors.skinTextSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <TextInput
          className="flex-1 bg-skin-surface border border-skin-border rounded-xl px-4 py-2.5 text-skin-text text-sm"
          value={input}
          onChangeText={setInput}
          placeholder={`${label} 제품명 입력`}
          placeholderTextColor={Colors.skinPlaceholder}
          maxLength={30}
          autoCapitalize="none"
          keyboardAppearance="dark"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          className={`rounded-xl px-4 py-2.5 ${
            input.trim() ? "bg-skin-primary" : "bg-skin-surface border border-skin-border"
          }`}
          onPress={handleAdd}
          disabled={!input.trim()}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-medium ${
              input.trim() ? "text-white" : "text-skin-text-secondary"
            }`}
          >
            추가
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
