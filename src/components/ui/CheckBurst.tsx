import { AnimatePresence, MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CheckBurstProps {
  visible: boolean;
  color: string;
}

const PARTICLE_COUNT = 8;
const RADIUS = 40;

export function CheckBurst({ visible, color }: CheckBurstProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatePresence>
        {visible && (
          <View style={styles.center}>
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
              const angle = (i * 2 * Math.PI) / PARTICLE_COUNT;
              const tx = Math.cos(angle) * RADIUS;
              const ty = Math.sin(angle) * RADIUS;

              return (
                <MotiView
                  key={i}
                  from={{
                    opacity: 1,
                    scale: 0,
                    translateX: 0,
                    translateY: 0,
                  }}
                  animate={{
                    opacity: 0,
                    scale: 1,
                    translateX: tx,
                    translateY: ty,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 600,
                    delay: i * 20,
                  }}
                  style={[
                    styles.particle,
                    { backgroundColor: color }
                  ]}
                />
              );
            })}
            
            {/* Inner glow ring */}
            <MotiView
              from={{ opacity: 0.8, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{
                type: 'timing',
                duration: 500,
              }}
              style={[
                styles.ring,
                { borderColor: color }
              ]}
            />
          </View>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ring: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  }
});
