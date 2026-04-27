import { BackgroundImage, Container, Group, Image, Text } from '@mantine/core';
import path from 'path';
import fs from 'fs';
import Link from 'next/link';
import { settings } from '../../../../utils/settings';
import FadeIn from '../../../../components/FadeIn';

export default async function Page() {
    const rankTableFilename = 'RanksTable.jsx';
    const rankTablePath = path.join(process.cwd(), 'components', rankTableFilename);
    const rankTableExists = fs.existsSync(rankTablePath);
    let RankTable = null;
    if (rankTableExists) {
        const module = await import('../../../../components/' + rankTableFilename);
        RankTable = module.default;
    }
    if (!RankTable) {
        return (
            <Container pos="relative" style={{ zIndex: 10 }}>
                <Text c="red" fz="lg" ta="center" mt="xl">Ranks table addon not installed. Purchase at https://buzz.dev/shop</Text>
            </Container>
        );
    }
    return (
        <>
            <FadeIn>
                <Container>
                    <RankTable />
                </Container>
            </FadeIn>
        </>
    );
}