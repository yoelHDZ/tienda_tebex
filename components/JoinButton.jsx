'use client';

import { Box, Button, Divider, Stack, Text, TextInput, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { TbCopy, TbCheck } from "react-icons/tb";
import { useSettings } from "../contexts/SettingsContext";
import { useState } from "react";
import { useTranslations } from 'next-intl';

function IPModal() {
    const t = useTranslations('Join');
    const settings = useSettings();
    const [copied, setCopied] = useState({});
    const copyIP = (key, ip) => {
        navigator.clipboard.writeText(ip);
        setCopied((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1500);
    }

    const hasJava = !!settings.server_ip;
    const hasBedrock = !!settings.server_bedrock_ip && !!settings.server_bedrock_port;

    return (
        <Box p="1rem" mt="1rem">
            <Title mb="0.4rem" lh={1} order={3} fw={600}>{t('joinUsingIp')}</Title>
            <Text c="dimmed">{t('useIpBelow')}</Text>
            <Stack mt="2rem">
                {hasJava && !hasBedrock && (
                    <TextInput
                        label={t('javaIp')}
                        value={settings.server_ip}
                        readOnly
                        size="lg"
                        styles={{ input: { borderRadius: "10px" } }}
                        rightSection={copied.java ? <TbCheck className="pointer" /> : <TbCopy className="pointer" onClick={() => copyIP('java', settings.server_ip)} />}
                    />
                )}
                {hasJava && hasBedrock && (
                    <>
                        <Divider label={t('javaIp')} labelPosition="center" />
                        <TextInput
                            label={t('javaIp')}
                            value={settings.server_ip}
                            readOnly
                            size="lg"
                            styles={{ input: { borderRadius: "10px" } }}
                            rightSection={copied.java ? <TbCheck className="pointer" /> : <TbCopy className="pointer" onClick={() => copyIP('java', settings.server_ip)} />}
                        />
                        <Divider label={t('bedrockIp')} labelPosition="center" />
                        <TextInput
                            label={t('bedrockIp')}
                            value={settings.server_bedrock_ip}
                            readOnly
                            size="lg"
                            styles={{ input: { borderRadius: "10px" } }}
                            rightSection={copied.bedrock_ip ? <TbCheck className="pointer" /> : <TbCopy className="pointer" onClick={() => copyIP('bedrock_ip', settings.server_bedrock_ip)} />}
                        />
                        <TextInput
                            label={t('bedrockPort')}
                            value={settings.server_bedrock_port}
                            readOnly
                            size="lg"
                            styles={{ input: { borderRadius: "10px" } }}
                            rightSection={copied.bedrock_port ? <TbCheck className="pointer" /> : <TbCopy className="pointer" onClick={() => copyIP('bedrock_port', settings.server_bedrock_port.toString())} />}
                        />
                    </>
                )}
                {!hasJava && hasBedrock && (
                    <>
                        <TextInput
                            label={t('bedrockIp')}
                            value={settings.server_bedrock_ip}
                            readOnly
                            size="lg"
                            styles={{ input: { borderRadius: "10px" } }}
                            rightSection={copied.bedrock_ip ? <TbCheck className="pointer" /> : <TbCopy className="pointer" onClick={() => copyIP('bedrock_ip', settings.server_bedrock_ip)} />}
                        />
                        <TextInput
                            label={t('bedrockPort')}
                            value={settings.server_bedrock_port}
                            readOnly
                            size="lg"
                            styles={{ input: { borderRadius: "10px" } }}
                            rightSection={copied.bedrock_port ? <TbCheck className="pointer" /> : <TbCopy className="pointer" onClick={() => copyIP('bedrock_port', settings.server_bedrock_port.toString())} />}
                        />
                    </>
                )}
                <Button onClick={() => modals.closeAll()} size="lg" color="primary">{t('close')}</Button>
            </Stack>
        </Box>
    )
}

export default function JoinButton({ children }) {
    const t = useTranslations('Join');
    const handleOpenModal = () => {
        modals.open({
            title: t('joinServer'),
            styles: {
                header: {
                    display: "none"
                }
            },
            children: <IPModal />,
            size: "50rem"
        });
    }

    return (
        <Box onClick={handleOpenModal}>
            {children}
        </Box>
    )
}