import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubble } from "@medusajs/icons";
import { Button, Container, Heading, Input, Label, Text, Textarea, Toaster, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { sdk } from "../../../lib/sdk";

type WhatsAppConfig = {
	id: string;
	whatsapp_number: string;
	message_template: string;
};

type WhatsAppConfigResponse = {
	whatsapp_config: WhatsAppConfig | null;
};

const VARIABLE_DOCS = [
	{ key: "{{id_do_pedido}}", desc: "Número do pedido" },
	{ key: "{{linhas_de_itens}}", desc: "Linhas com itens, quantidades e valores" },
	{ key: "{{subtotal}}", desc: "Subtotal formatado" },
	{ key: "{{desconto}}", desc: "Desconto (linha vazia se não houver)" },
	{ key: "{{total}}", desc: "Total formatado" },
	{ key: "{{nome_do_cliente}}", desc: "Nome do cliente" },
	{ key: "{{endereco}}", desc: "Endereço de entrega" },
];

const WhatsAppConfigPage = () => {
	const queryClient = useQueryClient();

	const [whatsappNumber, setWhatsappNumber] = useState("");
	const [messageTemplate, setMessageTemplate] = useState("");

	const { data, isLoading, isError, error } = useQuery<WhatsAppConfigResponse>({
		queryKey: ["whatsapp-config"],
		queryFn: () => sdk.client.fetch("/admin/whatsapp-config"),
	});

	// Populate form when data loads
	useEffect(() => {
		if (data?.whatsapp_config) {
			const cfg = data.whatsapp_config;
			setWhatsappNumber(cfg.whatsapp_number || "");
			setMessageTemplate(cfg.message_template || "");
		}
	}, [data]);

	const { mutate: saveConfig, isPending: isSaving } = useMutation({
		mutationFn: (body: Record<string, unknown>) =>
			sdk.client.fetch("/admin/whatsapp-config", {
				method: "POST",
				body,
			}),
		onSuccess: () => {
			toast.success("Configuração do WhatsApp salva");
			queryClient.invalidateQueries({ queryKey: ["whatsapp-config"] });
		},
		onError: () => {
			toast.error("Falha ao salvar configuração do WhatsApp");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!whatsappNumber.trim()) {
			toast.error("Número do WhatsApp é obrigatório");
			return;
		}
		if (!messageTemplate.trim()) {
			toast.error("Modelo de mensagem é obrigatório");
			return;
		}

		saveConfig({
			whatsapp_number: whatsappNumber.trim(),
			message_template: messageTemplate.trim(),
		});
	};

	const insertVariable = (variable: string) => {
		setMessageTemplate((prev) => prev + variable);
	};

	if (isLoading) {
		return (
			<Container>
				<Text>Carregando configuração...</Text>
			</Container>
		);
	}

	if (isError) {
		return (
			<Container className="flex flex-col items-center gap-4 p-6">
				<Text className="text-ui-fg-error">
					Falha ao carregar configuração: {error instanceof Error ? error.message : "Erro desconhecido"}
				</Text>
				<Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ["whatsapp-config"] })}>
					Tentar novamente
				</Button>
			</Container>
		);
	}

	return (
		<form onSubmit={handleSubmit}>
			<Container className="divide-y p-0">
				<div className="flex items-center justify-between px-6 py-4">
					<Heading level="h1">Configuração do WhatsApp Checkout</Heading>
					<Button type="submit" isLoading={isSaving}>
						Salvar
					</Button>
				</div>

				<div className="flex flex-col gap-6 px-6 py-4">
					<Text className="text-ui-fg-subtle">
						Configure o número do WhatsApp e o modelo de mensagem para o fluxo de checkout via WhatsApp. As alterações
						entram em vigor imediatamente.
					</Text>

					<div className="flex flex-col gap-2">
						<Label htmlFor="whatsapp_number" className="font-medium">
							Número do WhatsApp <span className="text-ui-fg-error">*</span>
						</Label>
						<Input
							id="whatsapp_number"
							placeholder="ex: 5554993255150"
							value={whatsappNumber}
							onChange={(e) => setWhatsappNumber(e.target.value)}
							required
						/>
						<Text className="text-ui-fg-muted text-sm">
							Número completo com código do país, sem o sinal &quot;+&quot;.
						</Text>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="message_template" className="font-medium">
							Modelo de mensagem <span className="text-ui-fg-error">*</span>
						</Label>
						<Textarea
							id="message_template"
							placeholder={"Olá! Gostaria de fazer um pedido: Pedido #{{id_do_pedido}}..."}
							value={messageTemplate}
							onChange={(e) => setMessageTemplate(e.target.value)}
							rows={6}
							required
						/>
						<Text className="text-ui-fg-muted text-sm">
							Use as variáveis abaixo para personalizar a mensagem. Elas serão substituídas pelos dados reais do pedido
							quando o cliente finalizar a compra.
						</Text>
					</div>

					{/* Variable picker */}
					<div className="flex flex-col gap-2">
						<Label className="font-medium">Variáveis disponíveis</Label>
						<div className="flex flex-wrap gap-2">
							{VARIABLE_DOCS.map((v) => (
								<button
									key={v.key}
									type="button"
									title={v.desc}
									onClick={() => insertVariable(v.key)}
									className="rounded-md border bg-ui-bg-base px-3 py-1.5 text-sm text-ui-fg-base transition-colors hover:bg-ui-bg-base-hover"
								>
									<code>{v.key}</code>
								</button>
							))}
						</div>
						<Text className="text-ui-fg-muted text-sm">
							Clique em uma variável para inseri-la ao final do modelo. Você também pode digitá-las manualmente.
						</Text>
					</div>

					{/* Variable reference table */}
					<div className="overflow-hidden rounded-lg border">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="bg-ui-bg-base-hover">
									<th className="px-4 py-2 font-medium">Variável</th>
									<th className="px-4 py-2 font-medium">Descrição</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{VARIABLE_DOCS.map((v) => (
									<tr key={v.key} className="even:bg-ui-bg-base-hover">
										<td className="px-4 py-2 font-mono text-ui-fg-accent">{v.key}</td>
										<td className="px-4 py-2 text-ui-fg-subtle">{v.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</Container>
			<Toaster />
		</form>
	);
};

export const config = defineRouteConfig({
	label: "WhatsApp Checkout",
	icon: ChatBubble,
});

export default WhatsAppConfigPage;
