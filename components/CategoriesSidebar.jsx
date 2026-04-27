'use client'

import { useMemo, useState } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { useGamemode } from "../contexts/GamemodeContext";
import { Anchor, Box, Collapse, Group, Image, Paper, Stack, Title } from "@mantine/core";
import Link from "next/link";
import { TbChevronRight } from "react-icons/tb";

export default function CategoriesSidebar({ categories }) {
    const settings = useSettings();
    const { enabled: gamemodesEnabled, activeGm } = useGamemode();
    const [opened, setOpened] = useState(false);
    const [expanded, setExpanded] = useState({});

    const tree = useMemo(() => {
        const byId = new Map();
        const nodes = categories.map((c) => ({ ...c, children: [] }));
        nodes.forEach((n) => byId.set(n.id, n));
        nodes.forEach((n) => {
            if (n.parent && byId.has(n.parent.id)) {
                byId.get(n.parent.id).children.push(n);
            }
        });

        let roots;
        if (gamemodesEnabled && activeGm?.category_id) {
            const gmCatId = Number(activeGm.category_id);
            if (byId.has(gmCatId)) {
                roots = byId.get(gmCatId).children;
            } else {
                roots = nodes.filter((n) => !n.parent);
            }
        } else {
            roots = nodes.filter((n) => !n.parent);
        }

        const sortTree = (arr) => {
            arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            arr.forEach((n) => sortTree(n.children));
        };
        sortTree(roots);
        return roots;
    }, [categories, gamemodesEnabled, activeGm]);

    const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const CategoryRow = ({ node, depth }) => {
        const hasChildren = node.children && node.children.length > 0;
        const hasPackages = Array.isArray(node.packages) && node.packages.length > 0;
        const isOpen = !!expanded[node.id];

        const LeftChevron = hasChildren ? (
            <Box onClick={(e) => { e.stopPropagation(); toggle(node.id); }} className="pointer" pr="0.2rem">
                <TbChevronRight style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms ease" }} size="1.2rem" />
            </Box>
        ) : <Box w={19} />;

        const Label = (
            <Group wrap="nowrap">
                <Image src={node.image_url} alt={node.name} w={35} />
                <Title fz="1.2rem" tt="uppercase" order={2}>{node.name}</Title>
            </Group>
        );

        const Content = hasPackages ? (
            <Anchor component={Link} c="bright" href={`/store/${node.slug}`}>{Label}</Anchor>
        ) : (
            <Box onClick={() => toggle(node.id)} className="pointer">{Label}</Box>
        );

        return (
            <>
                <Box style={{ borderRadius: 5 }} pos="relative" className={settings.featured_categories.includes((node.id || "").toString()) ? " featured-category" : ""} p="0.6rem" pl={`${depth * 1}rem`}>
                    <Group w="100%" justify="space-between" wrap="nowrap">
                        <Group wrap="nowrap">
                            {LeftChevron}
                            {Content}
                        </Group>
                        {settings.featured_categories.includes((node.id || "").toString()) && <Paper className="featured-category-label not-stuck" px="0.4rem" fz="0.9rem">{settings.featured_categories_label}</Paper>}
                    </Group>
                </Box>
                {hasChildren && (
                    <Collapse in={isOpen}>
                        <Stack>
                            {node.children.map((child) => (
                                <CategoryRow key={child.id} node={child} depth={depth + 1} />
                            ))}
                        </Stack>
                    </Collapse>
                )}
            </>
        );
    };

    return (
        <Stack>
            {tree.slice(0, 6).map((node) => (
                <CategoryRow key={node.id} node={node} depth={0} />
            ))}
            {tree.length > 6 && <>
                <Box ml={opened ? "-0.6rem" : "0"} onClick={() => setOpened(!opened)} style={{ transition: "0.2s ease-in-out", borderRadius: 5 }} pos="relative" className="pointer" p="0.6rem">
                    <Group wrap="nowrap">
                        <Image className="invert-icon" src="/more.png" alt="Plus icon" w={35} />
                        <Title c="bright" fz="1.4rem" tt="uppercase" order={2}>{opened ? "Less" : "More"}</Title>
                    </Group>
                </Box>
                <Collapse in={opened}>
                    <Stack>
                        {tree.slice(6).map((node) => (
                            <CategoryRow key={node.id} node={node} depth={0} />
                        ))}
                    </Stack>
                </Collapse>
            </>}
        </Stack>
    )
}
