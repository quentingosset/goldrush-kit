import { useEffect, useMemo, useState } from "react";
import {
    type DecodedEventType,
    type DecodedTransactionProps,
} from "@/utils/types/molecules.types";
import { type Option, None, Some } from "@/utils/option";
import { TokenAvatar } from "@/components/Atoms/TokenAvatar/TokenAvatar";
import { GRK_SIZES } from "@/utils/constants/shared.constants";
import {
    TypographyH1,
    TypographyH2,
    TypographyH4,
} from "@/components/ui/typography";
import { useChains } from "@/utils/store/Chains";
import { type ChainItem } from "@covalenthq/client-sdk";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";

export const DecodedTransactionView: React.FC<DecodedTransactionProps> = ({
    chain_name,
    tx_hash,
}) => {
    const { chains } = useChains();

    const [maybeResult, setResult] = useState<Option<DecodedEventType[]>>(None);

    const CHAIN = useMemo<ChainItem | null>(() => {
        return chains?.find((o) => o.name === chain_name) ?? null;
    }, [chains, chain_name]);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(
                    "http://localhost:8080/api/v1/tx/decode",
                    {
                        body: JSON.stringify({
                            network: chain_name,
                            tx_hash: tx_hash,
                        }),
                        headers: {
                            "content-type": "application/json",
                            "x-covalent-api-key": import.meta.env
                                .STORYBOOK_COVALENT_API_KEY as string,
                        },
                        method: "POST",
                    }
                );
                const { events } = (await response.json()) as {
                    events: DecodedEventType[];
                };
                setResult(new Some(events));
            } catch (exception) {
                console.error(exception);
                setResult(new Some([]));
            }
        })();
    }, [chain_name, tx_hash]);

    return (
        <>
            {maybeResult.match({
                None: () => <p>Loading...</p>,
                Some: (events) => (
                    <div>
                        <TypographyH1>Decoded Transaction</TypographyH1>

                        {!events.length ? (
                            <TypographyH4>No decoded Events.</TypographyH4>
                        ) : (
                            events.map(
                                ({
                                    action,
                                    category,
                                    name,
                                    details,
                                    nfts,
                                    protocol,
                                    tokens,
                                }) => (
                                    <article
                                        key={name}
                                        className="flex w-full flex-col gap-y-8"
                                    >
                                        <TypographyH2>
                                            <div className="mt-4 flex items-center gap-x-8">
                                                {protocol?.name}
                                                <div className="flex items-center justify-between gap-x-4">
                                                    <Badge>{action}</Badge>
                                                    <Badge>{category}</Badge>
                                                </div>
                                            </div>
                                        </TypographyH2>

                                        {tokens?.length && (
                                            <div>
                                                <TypographyH4>
                                                    Tokens
                                                </TypographyH4>

                                                <div className="mt-4 grid grid-cols-4 items-center justify-evenly gap-4">
                                                    {tokens.map(
                                                        (
                                                            {
                                                                heading,
                                                                pretty,
                                                                ticker_logo,
                                                                ticker_symbol,
                                                            },
                                                            i
                                                        ) => (
                                                            <div
                                                                key={
                                                                    ticker_symbol ||
                                                                    "" + i
                                                                }
                                                            >
                                                                <CardDescription
                                                                    className="truncate text-ellipsis"
                                                                    title={
                                                                        heading
                                                                    }
                                                                >
                                                                    {heading ||
                                                                        "Token Amount"}
                                                                </CardDescription>
                                                                <CardTitle className="flex items-center gap-x-2 truncate">
                                                                    <TokenAvatar
                                                                        size={
                                                                            GRK_SIZES.EXTRA_SMALL
                                                                        }
                                                                        chainColor={
                                                                            CHAIN
                                                                                ?.color_theme
                                                                                .hex
                                                                        }
                                                                        tokenUrl={
                                                                            ticker_logo
                                                                        }
                                                                    />
                                                                    {pretty}{" "}
                                                                    {
                                                                        ticker_symbol
                                                                    }
                                                                </CardTitle>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {details?.length && (
                                            <div>
                                                <TypographyH4>
                                                    Details
                                                </TypographyH4>

                                                <div className="mt-4 grid grid-cols-4 items-center justify-evenly gap-4">
                                                    {details.map(
                                                        (
                                                            { title, value },
                                                            i
                                                        ) => (
                                                            <div
                                                                key={title + i}
                                                                className="truncate text-ellipsis"
                                                            >
                                                                <CardDescription
                                                                    className="truncate text-ellipsis"
                                                                    title={
                                                                        title
                                                                    }
                                                                >
                                                                    {title}
                                                                </CardDescription>
                                                                <CardTitle
                                                                    className="truncate text-ellipsis"
                                                                    title={
                                                                        value
                                                                    }
                                                                >
                                                                    {value}
                                                                </CardTitle>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {nfts?.length && (
                                            <div>
                                                <TypographyH4>
                                                    NFTs
                                                </TypographyH4>

                                                <div className="mt-4 grid grid-cols-4 items-center justify-evenly gap-4">
                                                    {nfts.map(
                                                        ({
                                                            collection_address,
                                                            collection_name,
                                                            heading,
                                                            images,
                                                            token_identifier,
                                                        }) => (
                                                            <Card
                                                                key={
                                                                    collection_address +
                                                                    token_identifier
                                                                }
                                                                className="w-64 rounded border"
                                                            >
                                                                <CardContent>
                                                                    <img
                                                                        className={`block h-64 w-64 rounded-t`}
                                                                        src={
                                                                            images[256] ||
                                                                            images[512] ||
                                                                            images[1024] ||
                                                                            images.default ||
                                                                            ""
                                                                        }
                                                                        onError={(
                                                                            e
                                                                        ) => {
                                                                            e.currentTarget.classList.remove(
                                                                                "object-cover"
                                                                            );
                                                                            e.currentTarget.classList.add(
                                                                                "p-2"
                                                                            );
                                                                            e.currentTarget.src =
                                                                                "https://www.datocms-assets.com/86369/1685489960-nft.svg";
                                                                        }}
                                                                    />
                                                                </CardContent>

                                                                <div className="truncate text-ellipsis p-4">
                                                                    <p
                                                                        title={
                                                                            heading
                                                                        }
                                                                    >
                                                                        {
                                                                            heading
                                                                        }
                                                                    </p>

                                                                    <CardDescription
                                                                        title={
                                                                            collection_name ||
                                                                            "<NO COLLECTION NAME>"
                                                                        }
                                                                        className="truncate text-ellipsis"
                                                                    >
                                                                        {collection_name ||
                                                                            "<NO COLLECTION NAME>"}
                                                                    </CardDescription>
                                                                    <CardTitle>
                                                                        #
                                                                        {
                                                                            token_identifier
                                                                        }
                                                                    </CardTitle>
                                                                </div>
                                                            </Card>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                )
                            )
                        )}
                    </div>
                ),
            })}
        </>
    );
};