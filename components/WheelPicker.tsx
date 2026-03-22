import { View, Text, ScrollView } from "react-native";
import { useRef, useCallback } from "react";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

interface WheelPickerProps {
  data: number[];
  labels?: string[];
  selectedIndex: number;
  onSelect: (value: number) => void;
}

export default function WheelPicker({
  data,
  labels,
  selectedIndex,
  onSelect,
}: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      if (index >= 0 && index < data.length) {
        onSelect(data[index]);
      }
    },
    [data, onSelect]
  );

  return (
    <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }} className="flex-1">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * paddingItems,
        }}
        contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
        onMomentumScrollEnd={handleScroll}
      >
        {data.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <View
              key={item}
              style={{ height: ITEM_HEIGHT }}
              className="items-center justify-center"
            >
              <Text
                className={`text-xl ${
                  isSelected
                    ? "text-white font-bold text-2xl"
                    : "text-white/30 font-medium"
                }`}
              >
                {labels ? labels[index] : item}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Selection indicator */}
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 rounded-lg bg-white/10"
        style={{
          top: ITEM_HEIGHT * paddingItems,
          height: ITEM_HEIGHT,
        }}
      />
    </View>
  );
}

export { ITEM_HEIGHT, VISIBLE_ITEMS };
