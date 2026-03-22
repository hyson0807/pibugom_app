import { View, Text, ScrollView } from "react-native";
import { useRef, useCallback } from "react";

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

interface WheelPickerProps {
  data: number[];
  labels?: string[];
  selectedIndex: number;
  onSelect: (value: number) => void;
  visibleItems?: number;
}

export default function WheelPicker({
  data,
  labels,
  selectedIndex,
  onSelect,
  visibleItems = VISIBLE_ITEMS,
}: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const paddingItems = Math.floor(visibleItems / 2);

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
    <View style={{ height: ITEM_HEIGHT * visibleItems }} className="flex-1">
      {/* Selection indicator (behind scroll content) */}
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 rounded-full bg-skin-primary"
        style={{
          top: ITEM_HEIGHT * paddingItems,
          height: ITEM_HEIGHT,
        }}
      />

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
                className={`text-sm ${
                  isSelected
                    ? "text-white font-bold text-base"
                    : "text-white/30 font-medium"
                }`}
              >
                {labels ? labels[index] : item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export { ITEM_HEIGHT, VISIBLE_ITEMS };
