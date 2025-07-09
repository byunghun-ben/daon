import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Button from "../Button/Button";

interface CustomDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomDateTimePicker({
  value,
  onChange,
  mode = "datetime",
  label,
  placeholder,
  disabled = false,
}: CustomDateTimePickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleConfirm = () => {
    onChange(tempDate);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempDate(value);
    setIsVisible(false);
  };

  const formatDate = (date: Date) => {
    switch (mode) {
      case "date":
        return date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      case "time":
        return date.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "datetime":
      default:
        return date.toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
    }
  };

  return (
    <View>
      {label && (
        <Text className="text-base font-medium mb-2 text-gray-700">{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setIsVisible(true)}
        className={`bg-gray-100 p-3 rounded-lg ${disabled ? "opacity-50" : ""}`}
        disabled={disabled}
      >
        <Text className="text-gray-800">
          {formatDate(value) || placeholder || "날짜/시간 선택"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white m-4 rounded-lg p-6 w-80">
            <Text className="text-lg font-bold mb-4 text-center">
              {label || "날짜/시간 선택"}
            </Text>
            
            <View className="mb-6">
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={(_event, date) => {
                  if (date) {
                    setTempDate(date);
                  }
                }}
                locale="ko-KR"
                style={{ backgroundColor: "white" }}
              />
            </View>

            <View className="flex-row gap-3">
              <Button
                title="취소"
                variant="outline"
                onPress={handleCancel}
                className="flex-1"
              />
              <Button
                title="확인"
                variant="primary"
                onPress={handleConfirm}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}