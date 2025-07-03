import { StyleSheet } from "react-native";
import type { Theme } from "../config/theme";

export const createFormStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.subtitle.fontSize,
      fontWeight: theme.typography.subtitle.fontWeight,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    required: {
      color: theme.colors.error,
    },
    input: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 48,
    },
    textArea: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 100,
      textAlignVertical: "top",
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 48,
    },
    dateButtonText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
      flex: 1,
    },
    errorText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    dateIcon: {
      fontSize: 20,
      color: theme.colors.textSecondary,
    },
    row: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    halfWidth: {
      flex: 1,
    },
    pickerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 48,
    },
    pickerText: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
    },
    submitButton: {
      marginTop: theme.spacing.xl,
    },
    helpText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      fontStyle: "italic",
    },
    milestoneCard: {
      backgroundColor: `${theme.colors.primary}10`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    milestoneHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    milestoneTitle: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600",
      color: theme.colors.primary,
      flex: 1,
    },
    removeButton: {
      color: theme.colors.error,
      fontSize: 18,
    },
  });
