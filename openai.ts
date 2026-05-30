import { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';

type OrbState = 'idle' | 'recording' | 'processing' | 'speaking';

interface PulsingOrbProps {
  state: OrbState;
}

const STATE_COLORS: Record<OrbState, string> = {
  idle: '#CC0000',
  recording: '#FF3333',
  processing: '#FF6600',
  speaking: '#FF0044',
};

const STATE_SPEEDS: Record<OrbState, number> = {
  idle: 1200,
  recording: 600,
  processing: 800,
  speaking: 500,
};

export default function PulsingOrb({ state }: PulsingOrbProps) {
  const color = STATE_COLORS[state];
  const speed = STATE_SPEEDS[state];

  const scale1Anim = useRef(new Animated.Value(1)).current;
  const scale2Anim = useRef(new Animated.Value(1)).current;
  const scale3Anim = useRef(new Animated.Value(1)).current;
  const opacity1Anim = useRef(new Animated.Value(0.6)).current;
  const opacity2Anim = useRef(new Animated.Value(0.4)).current;
  const opacity3Anim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale1Anim, {
          toValue: 1.15,
          duration: speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale1Anim, {
          toValue: 1,
          duration: speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale2Anim, {
          toValue: 1.3,
          duration: speed * 1.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale2Anim, {
          toValue: 1,
          duration: speed * 1.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale3Anim, {
          toValue: 1.5,
          duration: speed * 1.6,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale3Anim, {
          toValue: 1,
          duration: speed * 1.6,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity1Anim, {
          toValue: 1,
          duration: speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity1Anim, {
          toValue: 0.6,
          duration: speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity2Anim, {
          toValue: 0.6,
          duration: speed * 1.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity2Anim, {
          toValue: 0.4,
          duration: speed * 1.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity3Anim, {
          toValue: 0.3,
          duration: speed * 1.6,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity3Anim, {
          toValue: 0.2,
          duration: speed * 1.6,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [speed]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.ring,
          styles.ring3,
          { borderColor: color },
          {
            transform: [{ scale: scale3Anim }],
            opacity: opacity3Anim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ring2,
          { borderColor: color },
          {
            transform: [{ scale: scale2Anim }],
            opacity: opacity2Anim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ring1,
          { borderColor: color },
          {
            transform: [{ scale: scale1Anim }],
            opacity: opacity1Anim,
          },
        ]}
      />
      <View style={[styles.core, { shadowColor: color, borderColor: color }]}>
        <View style={[styles.innerCore, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring3: {
    width: 170,
    height: 170,
  },
  ring2: {
    width: 130,
    height: 130,
  },
  ring1: {
    width: 100,
    height: 100,
  },
  core: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(180,0,0,0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 8,
  },
  innerCore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.9,
  },
});
