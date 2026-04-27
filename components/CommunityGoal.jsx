'use client'

import { Group, Progress, RingProgress, SemiCircleProgress, Text } from '@mantine/core';
import { useSettings } from "../contexts/SettingsContext";

export default function CommunityGoal({ goal }) {
    const settings = useSettings();
    const variant = settings?.community_goal_variant || 'bar';
    const progressValue = process.env.NEXT_PUBLIC_IS_DEMO === "true" ? 23 : (goal ? goal.current : 0);

    let ProgressComponent;
    if (variant === 'semicircle') {
        ProgressComponent = (
            <SemiCircleProgress
                fillDirection="left-to-right"
                orientation="up"
                filledSegmentColor="blue"
                size={300}
                thickness={28}
                classNames={{ emptySegment: "community-goal-progress-stroke" }}
                styles={{
                    filledSegment: {
                        stroke: "var(--mantine-color-primary-5)",
                    },
                }}
                value={progressValue}
                label={<Text span fw={700} c="bright">{`$${progressValue} / $${goal?.target || 0}`}</Text>}
            />
        );
    } else if (variant === 'ring') {
        ProgressComponent = (
            <RingProgress
                size={250}
                thickness={28}
                styles={{
                    label: {
                        fontWeight: 700,
                    },
                }}
                label={
                    <Text size="xl" fw={600} ta="center">
                        {`$${progressValue} / $${goal?.target || 0}`}
                    </Text>
                }
                sections={[
                    { value: (progressValue / goal.target) * 100, color: 'cyan' },
                    { value: 100 - (progressValue / goal.target) * 100, color: 'gray' },
                ]}
            />
        );
    } else {
        ProgressComponent = <div>
            <Progress animated classNames={{ root: "community-goal-progress-background" }} size="xl" color="primary" value={(progressValue / goal.target) * 100} />
            <Group w="100%" mt="0.2rem" justify="space-between">
                <Text>{`$${progressValue > 0 ? parseFloat(progressValue).toFixed(2) : 0}`}</Text>
                <Text>{`$${goal.target || 0}`}</Text>
            </Group>
        </div>;
    }

    return (
        <Group display="block" w="100%" justify="center">
            {ProgressComponent}
        </Group>
    );
}