import React from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { X, Printer } from 'lucide-react-native';
import ThermalReceiptTemplate, { ThermalSettings } from './ThermalReceiptTemplate';
import { Transaction } from '../../services/DatabaseService';

export interface ThermalReceiptPreviewProps {
  visible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  settings: ThermalSettings;
  onPrint: () => void;
  loading?: boolean;
}

const ThermalReceiptPreview: React.FC<ThermalReceiptPreviewProps> = ({ 
  visible, 
  onClose, 
  transaction, 
  settings, 
  onPrint, 
  loading = false 
}) => {
  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          maxHeight: '90%',
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#111827',
            }}>
              Preview Struk
            </Text>
            <Pressable onPress={onClose}>
              <X size={24} color="#374151" />
            </Pressable>
          </View>

          {/* Receipt Preview */}
          <ScrollView 
            style={{ maxHeight: 400, marginBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <ThermalReceiptTemplate
              transaction={transaction}
              settings={settings}
              isPreview={true}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={onPrint}
              disabled={loading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: loading ? '#9ca3af' : '#16a34a',
                borderRadius: 12,
              }}
            >
              <Printer size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={{ 
                color: 'white', 
                fontWeight: '600', 
                fontSize: 16 
              }}>
                {loading ? 'Mencetak...' : 'Cetak Sekarang'}
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Text style={{ 
                color: '#6b7280', 
                fontWeight: '600', 
                fontSize: 16 
              }}>
                Tutup
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ThermalReceiptPreview;
