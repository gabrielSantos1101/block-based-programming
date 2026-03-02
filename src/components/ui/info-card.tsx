import { Info } from "lucide-react";
import React, { createContext, useContext, useMemo } from "react";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

type PlacementProps = {
	side?: Parameters<typeof HoverCardContent>[0]["side"];
	sideOffset?: Parameters<typeof HoverCardContent>[0]["sideOffset"];
	align?: Parameters<typeof HoverCardContent>[0]["align"];
	alignOffset?: Parameters<typeof HoverCardContent>[0]["alignOffset"];
};

type InfoCardProviderProps = PlacementProps & {
	variant?: "default" | "destructive";
	icon?: React.ReactNode;
	className?: string;
	contentClassName?: string;
	children: React.ReactNode;
};

type InfoCardContextValue = Required<PlacementProps> & {
	variant: "default" | "destructive";
	icon: React.ReactNode;
	className?: string;
	contentClassName?: string;
};

const InfoCardContext = createContext<InfoCardContextValue | null>(null);

function useInfoCardContext() {
	const ctx = useContext(InfoCardContext);
	if (!ctx) {
		throw new Error("InfoCard components must be used inside <InfoCard>");
	}
	return ctx;
}

function InfoCard({
	children,
	variant = "default",
	icon = <Info size={16} className="text-muted-foreground" />,
	side = "right",
	sideOffset = 6,
	align = "center",
	alignOffset = 0,
	className,
	contentClassName,
}: InfoCardProviderProps) {
	const value = useMemo(
		() => ({
			variant,
			icon,
			side,
			sideOffset,
			align,
			alignOffset,
			className,
			contentClassName,
		}),
		[
			variant,
			icon,
			side,
			sideOffset,
			align,
			alignOffset,
			className,
			contentClassName,
		],
	);

	const hasTrigger = React.Children.toArray(children).some(
		(child) =>
			React.isValidElement(child) &&
			(child.type as any)?.displayName === "InfoCardTrigger",
	);

	return (
		<InfoCardContext.Provider value={value}>
			<HoverCard>
				{hasTrigger ? null : <InfoCardTrigger>{icon}</InfoCardTrigger>}
				{children}
			</HoverCard>
		</InfoCardContext.Provider>
	);
}

type InfoCardTriggerProps = React.ComponentProps<typeof HoverCardTrigger>;

const InfoCardTrigger = React.forwardRef<
	React.ElementRef<typeof HoverCardTrigger>,
	InfoCardTriggerProps
>(function InfoCardTrigger({ className, children, ...props }, ref) {
	return (
		<HoverCardTrigger
			ref={ref}
			className={cn(
				"cursor-help inline-flex items-center gap-1 no-underline text-inherit",
				className,
			)}
			{...props}
		>
			{children}
		</HoverCardTrigger>
	);
});
InfoCardTrigger.displayName = "InfoCardTrigger";

type InfoCardContentProps = React.ComponentProps<typeof HoverCardContent> & {
	title?: React.ReactNode;
	description?: React.ReactNode;
	action?: React.ReactNode;
	hideFrame?: boolean;
};

const InfoCardContent = React.forwardRef<
	React.ElementRef<typeof HoverCardContent>,
	InfoCardContentProps
>(function InfoCardContent(
	{
		className,
		children,
		title,
		description,
		action,
		hideFrame = false,
		...props
	},
	ref,
) {
	const {
		variant,
		icon,
		side,
		sideOffset,
		align,
		alignOffset,
		className: alertClassName,
		contentClassName,
	} = useInfoCardContext();

	return (
		<HoverCardContent
			ref={ref}
			side={props.side ?? side}
			sideOffset={props.sideOffset ?? sideOffset}
			align={props.align ?? align}
			alignOffset={props.alignOffset ?? alignOffset}
			className={cn("p-0 w-80", contentClassName, className)}
			{...props}
		>
			{hideFrame ? (
				children
			) : (
				<Alert variant={variant} className={cn("shadow-sm", alertClassName)}>
					{icon}
					{title ? <AlertTitle>{title}</AlertTitle> : null}
					{description ? (
						<AlertDescription>{description}</AlertDescription>
					) : null}
					{children}
					{action ? <AlertAction>{action}</AlertAction> : null}
				</Alert>
			)}
		</HoverCardContent>
	);
});
InfoCardContent.displayName = "InfoCardContent";

export { InfoCard, InfoCardTrigger, InfoCardContent };
export type {
	InfoCardProviderProps as InfoCardProps,
	InfoCardTriggerProps,
	InfoCardContentProps,
};
