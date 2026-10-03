import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBaseUrl, setBaseUrl, apiService } from "../api/apiService";
import { COLORS, RADIUS, SPACING } from "../styles/theme";

export default function Header({ onRefresh }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputUrl, setInputUrl] = useState(getBaseUrl());
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState("");

  const handleTestConnection = async (urlToTest) => {
    setTestStatus("testing");
    setStatusMessage("Pinging backend server...");
    try {
      setBaseUrl(urlToTest);
      const res = await apiService.checkHealth();
      if (res && res.success) {
        setTestStatus("success");
        setStatusMessage("Connected: " + (res.message || "API Running"));
        if (onRefresh) onRefresh();
      } else {
        setTestStatus("error");
        setStatusMessage("Received unexpected response from server");
      }
    } catch (err) {
      setTestStatus("error");
      setStatusMessage("Failed: " + err.message);
    }
  };

  const handleSave = () => {
    setBaseUrl(inputUrl);
    setModalVisible(false);
    if (onRefresh) onRefresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.brandGroup}>
          <View style={styles.pulseDot} />
          <Text style={styles.brandTitle}>FORM<Text style={styles.brandAccent}>FEEDBACK</Text></Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            setInputUrl(getBaseUrl());
            setTestStatus(null);
            setStatusMessage("");
            setModalVisible(true);
          }}
        >
          <Ionicons name="hardware-chip-outline" size={16} color={COLORS.primary} />
          <Text style={styles.serverStatusText} numberOfLines={1}>
            {getBaseUrl().replace("http://", "")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Backend Connection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend Server Configuration</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter your backend API URL. When running on a physical device, ensure your phone is connected to the same Wi-Fi as your PC.
            </Text>

            <TextInput
              style={styles.urlInput}
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="http://192.168.x.x:7000"
              placeholderTextColor={COLORS.textSubtle}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {statusMessage ? (
              <View
                style={[
                  styles.statusAlert,
                  testStatus === "success"
                    ? styles.statusSuccess
                    : testStatus === "error"
                    ? styles.statusError
                    : styles.statusTesting,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    testStatus === "success"
                      ? { color: COLORS.good }
                      : testStatus === "error"
                      ? { color: COLORS.danger }
                      : { color: COLORS.info },
                  ]}
                >
                  {statusMessage}
                </Text>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.testBtn}
                onPress={() => handleTestConnection(inputUrl)}
              >
                <Text style={styles.testBtnText}>Test Ping</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  brandTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 170,
  },
  serverStatusText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
  modalDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  urlInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "System",
  },
  statusAlert: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: COLORS.goodBg,
    borderColor: COLORS.goodBorder,
  },
  statusError: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
  },
  statusTesting: {
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.info,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  testBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  testBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    color: "#0A0E17",
    fontSize: 13,
    fontWeight: "700",
  },
});
