# Cambios de texto en español

Lista para QA antes de salir a producción. La traducción al inglés queda detrás de `ENGLISH_FOR_SUPER_ADMINS_ONLY` (`src/i18n/config.ts`), pero el español sale para todos los usuarios, así que estos son los textos que un usuario puede notar distintos frente a `main`.

De 6.274 textos simples, 5.972 son idénticos a `main`. Cambiaron 302: 142 solo en tildes o mayúsculas y 160 en redacción o son nuevos (textos que antes estaban en inglés, etiquetas de accesibilidad, mensajes partidos que ahora son una frase). Los textos con variables o plurales (unos 880) no se comparan tal cual: revísalos navegando las pantallas.

## Redacción distinta o texto nuevo

### Cartera (clientes) (30)

| Texto | Clave |
|---|---|
| Buscar en coordinador... | `clients.home.filters.search.coordinators` |
| Buscar en mercado... | `clients.home.filters.search.markets` |
| Agregar facturas | `clients.applyTab.sections.invoices.add` |
| Agregar pagos | `clients.applyTab.sections.payments.add` |
| Agregar notas crédito | `clients.applyTab.sections.creditMemos.add` |
| Agregar saldos | `clients.applyTab.sections.deductions.add` |
| Descargar Excel log de aplicación | `clients.applyTab.generateActionModal.downloadExcelLog` |
| Cambiar prompt CashportAI | `clients.applyTab.generateActionModal.changeAIPrompt` |
| Error al crear los ajustes | `clients.applyModals.shared.createError` |
| PDF, Word, PNG. (Tamaño máx. 30MB) | `clients.invoiceActions.debitNote.fileHint` |
| Descargando estado de cuenta | `clients.bulkSearch.progress.downloadingStatement` |
| Enviando estado de cuenta | `clients.bulkSearch.progress.sendingStatement` |
| Aplicando cambiar estado | `clients.bulkSearch.actions.changeStatus.applying` |
| No se pudo cambiar estado. | `clients.bulkSearch.actions.changeStatus.error` |
| Aplicando aplicar pago | `clients.bulkSearch.actions.applyPayment.applying` |
| No se pudo aplicar pago. | `clients.bulkSearch.actions.applyPayment.error` |
| Aplicando registrar novedad | `clients.bulkSearch.actions.registerDispute.applying` |
| No se pudo registrar novedad. | `clients.bulkSearch.actions.registerDispute.error` |
| Aplicando radicar facturas | `clients.bulkSearch.actions.submitInvoices.applying` |
| No se pudo radicar facturas. | `clients.bulkSearch.actions.submitInvoices.error` |
| Aplicando enviar estado de cuenta | `clients.bulkSearch.actions.sendStatement.applying` |
| No se pudo enviar estado de cuenta. | `clients.bulkSearch.actions.sendStatement.error` |
| Cerrada - Desvinculada | `clients.invoiceDetail.tags.closedUnlinked` |
| Abierta - Desvinculada | `clients.invoiceDetail.tags.openUnlinked` |
| ¿Estás seguro de que deseas anular esta aplicación de pago? | `clients.history.voidConfirm.title` |
| Ingresa la información para editar un contacto existente | `clients.contacts.modal.infoEdit` |
| Ingresa la información para crear un nuevo contacto | `clients.contacts.modal.infoCreate` |
| ¡Pago identificado enviado correctamente! | `clients.payments.identifiedPayments.success` |
| Ingresa la información para identificar el pago | `clients.payments.identifyPayment.subtitle` |
| No hay ajustes disponibles para seleccionar | `clients.balanceSettlement.noAdjustmentsAvailable` |

### Tablas, selectores y servicios (23)

| Texto | Clave |
|---|---|
| Selecciona un país | `shared.selects.selectCountry` |
| Seleccione el rol | `shared.selects.selectContactRole` |
| ¿Volver a enviar invitación? | `shared.tables.resendInvitation` |
| Ups, hubo un error. Por favor, intenta más tarde. | `shared.tables.genericError` |
| El usuario fue editado exitosamente. | `shared.userForm.updatedSuccess` |
| Ups, ocurrió un error. | `shared.userForm.genericError` |
| Su sesión expiró. Por favor, solicite un nuevo acceso. | `shared.session.expiredRequestAccess` |
| No se encontró el proyecto. | `shared.project.notFound` |
| No se pudo cargar el proyecto. | `shared.project.loadError` |
| Ups, ocurrió un error. | `shared.services.genericError` |
| Error al enviar el mensaje | `shared.services.sendMessageError` |
| Ups, ocurrió un error cambiando el estado del cliente. | `shared.services.customerStatusError` |
| Ups, ocurrió un error editando el documento del cliente. | `shared.services.customerDocumentError` |
| Ups, ocurrió un error eliminando el tipo de cliente. | `shared.services.deleteCustomerTypeError` |
| Ups, ocurrió un error creando el tipo de documento. | `shared.services.createDocumentTypeError` |
| Ups, ocurrió un error eliminando el tipo de documento. | `shared.services.deleteDocumentTypeError` |
| Error desconocido al obtener las bodegas | `shared.services.warehousesUnknownError` |
| Ups, ocurrió un error creando la dirección. | `shared.services.createAddressError` |
| Ups, ocurrió un error actualizando el Ship To. | `shared.services.updateShipToError` |
| Ups, ocurrió un error eliminando el Ship To. | `shared.services.deleteShipToError` |
| El usuario fue activado exitosamente. | `shared.services.userActivated` |
| El usuario fue desactivado exitosamente. | `shared.services.userDeactivated` |
| El tipo de cliente fue creado exitosamente. | `shared.services.customerTypeCreated` |

### Ventanas emergentes (20)

| Texto | Clave |
|---|---|
| Error al obtener el detalle de stock de la bodega | `modals.changeWarehouse.stockError` |
| Nota crédito creada con éxito | `modals.createAdjustment.credit.success` |
| Oops, ocurrió un error creando la nota crédito. Por favor, intente nuevamente. | `modals.createAdjustment.credit.error` |
| Nota débito creada con éxito | `modals.createAdjustment.debit.success` |
| Oops, ocurrió un error creando la nota débito. Por favor, intente nuevamente. | `modals.createAdjustment.debit.error` |
| Oops, ocurrió un error creando el descuento. Por favor, intente nuevamente. | `modals.createAdjustment.discount.error` |
| ¿Estás seguro de que deseas eliminar este/os descuento(s)? | `modals.deleteDiscount.title` |
| Mientras no haya cargas anteriores solo se revisan tipos y obligatorias; las desviaciones empiezan a contar desde la segunda carga. "Bloquear" detiene el cargue; "Advertir" lo deja pasar y queda en el historial. | `modals.intakeStructure.loaderValidations.footnote` |
| Las facturas ya tienen novedades abiertas. ¿Qué deseas hacer con las novedades? | `modals.registerNews.openDisputes.title` |
| ¿Estás seguro de que deseas eliminar este canal? | `modals.removeChannel.title` |
| ¿Estás seguro de que deseas eliminar esta línea? | `modals.removeLine.title` |
| ¿Estás seguro de que deseas eliminar esta sublínea? | `modals.removeSubline.title` |
| Seleccionar nota débito | `modals.resolveNovelty.selectDebitMemo` |
| Seleccionar nota crédito | `modals.resolveNovelty.selectCreditMemo` |
| Seleccionar descuento | `modals.resolveNovelty.selectDiscount` |
| Crear débito | `modals.selectAccountingAdjustment.createDebit` |
| Crear crédito | `modals.selectAccountingAdjustment.createCredit` |
| Editar Ship To | `modals.shipTo.editTitle` |
| Ocurrió un error al agregar la dirección. | `modals.shipTo.address.addError` |
| Los documentos seleccionados reemplazarán los actuales | `modals.uploadDocument.descriptionEdit` |

### Alertas de bloqueo (14)

| Texto | Clave |
|---|---|
| Se bloquea hoy | `blockingAlerts.statusLabel.blocksToday` |
| Se bloquea mañana | `blockingAlerts.statusLabel.blocksTomorrow` |
| Al día · saldo a favor | `blockingAlerts.statusLabel.okCredit` |
| Bloqueo: facturas de +60 días o cupo superado · Alerta desde 45 días | `blockingAlerts.rules` |
| Sin clientes en esta vista | `blockingAlerts.list.emptyCustomers` |
| Sin puntos de venta en esta vista | `blockingAlerts.list.emptyPointsOfSale` |
| No encontramos este cliente | `blockingAlerts.list.customerNotFound` |
| Pueden pagar el valor vencido aquí: | `blockingAlerts.sendToClient.payHere` |
| Adjuntamos el estado de cuenta. | `blockingAlerts.sendToClient.statementAttached` |
| Adjuntamos el estado de cuenta con corte de hoy. | `blockingAlerts.sendToClient.statementAttachedToday` |
| Plantilla · Cobro con link de pago | `blockingAlerts.sendToClient.template` |
| El QR estará disponible al conectar el servicio de pagos | `blockingAlerts.paymentLink.qrSoon` |
| Escribe un correo válido para enviar. | `blockingAlerts.statement.invalidEmail` |
| Elige qué incluir | `blockingAlerts.statement.chooseWhat` |

### WhatsApp (11)

| Texto | Clave |
|---|---|
| Mostrar información del cliente | `chat.thread.showClientInfo` |
| Ir a la página anterior | `chat.ui.previousPage` |
| Ir a la página siguiente | `chat.ui.nextPage` |
| Más páginas | `chat.ui.morePages` |
| Diapositiva anterior | `chat.ui.previousSlide` |
| Diapositiva siguiente | `chat.ui.nextSlide` |
| Barra lateral | `chat.ui.sidebar` |
| Muestra la barra lateral en móvil. | `chat.ui.sidebarDescription` |
| Mostrar u ocultar barra lateral | `chat.ui.toggleSidebar` |
| Paleta de comandos | `chat.ui.commandPalette` |
| Busca un comando para ejecutar... | `chat.ui.commandPaletteDescription` |

### Textos comunes (8)

| Texto | Clave |
|---|---|
| No encontramos resultados | `common.status.noResults` |
| Selecciona una fecha | `common.placeholders.selectDate` |
| Escribe aquí | `common.placeholders.write` |
| Ingresa un correo válido | `common.validation.invalidEmail` |
| Ingresa un número válido | `common.validation.invalidNumber` |
| Algo salió mal. Intenta de nuevo. | `common.feedback.genericError` |
| No pudimos cargar la información. Intenta de nuevo. | `common.feedback.loadError` |
| La solicitud tardó demasiado y se canceló. Intenta de nuevo. | `common.feedback.timeoutError` |

### Descuentos (7)

| Texto | Clave |
|---|---|
| Paquete de descuentos activado con éxito | `discounts.list.packageActivated` |
| Paquete de descuentos desactivado con éxito | `discounts.list.packageDeactivated` |
| Descuento activado con éxito | `discounts.list.discountActivated` |
| Descuento desactivado con éxito | `discounts.list.discountDeactivated` |
| Quitar descuento | `discounts.columns.remove` |
| Eliminar rango | `discounts.byOrder.removeRange` |
| El descuento debe ser mayor a 0% | `discounts.validation.discountPositivePercent` |

### Configuración del Marketplace (7)

| Texto | Clave |
|---|---|
| No se encontraron paquetes de descuento. | `marketAdmin.discountsTable.packages.empty` |
| Eliminar nivel | `marketAdmin.promotions.removeLevel` |
| Eliminar opción | `marketAdmin.promotions.rewards.removeOption` |
| Eliminar paquete | `marketAdmin.promotions.target.removeBundle` |
| Multiplicador del regalo. Cuando vale ≥ 2 y la promoción tiene un solo rango, el regalo se entrega hasta ''accumulable'' veces según cuántas veces se cumpla la condición mínima (ej. si vale 3 y la condición mínima es 1, el cliente puede llevarse hasta 3 regalos si compra 3 unidades que cumplen el mínimo). | `marketAdmin.promotions.card.tooltips.accumulable` |
| Restringe la promoción a una sola unidad de negocio (ej. ''Institucional'', ''Retail''). Si queda vacío, aplica a todas las unidades del proyecto. Solo se mostrará a clientes cuya BU en client_marketplace coincida. | `marketAdmin.promotions.card.tooltips.businessUnit` |
| Promoción ''flex'': el cliente recibe el regalo automáticamente, sin tener que elegir entre las opciones A/B/C. Si está apagada, el cliente debe elegir una opción. | `marketAdmin.promotions.card.tooltips.isFlex` |

### Visitas (5)

| Texto | Clave |
|---|---|
| Plan pendiente | `visits.layers.planFull` |
| No se pudieron cargar las visitas de hoy. | `visits.view.loadErrorToday` |
| No se pudieron cargar las visitas de ese día. | `visits.view.loadErrorDay` |
| No hay asesores en campo hoy. | `visits.view.noneToday` |
| No hay asesores en campo ese día. | `visits.view.noneDay` |

### Marketplace (4)

| Texto | Clave |
|---|---|
| Error al crear el borrador | `commerce.checkout.createDraftError` |
| Análisis Gross to Net | `commerce.dashboard.tabs.grossToNetTitle` |
| Puente financiero de ventas brutas a ingresos netos. | `commerce.dashboard.tabs.grossToNetDescription` |
| Clientes con descuento negociado (Plan Anual). Promedio de venta facturada de los meses cerrados; solo clientes con promedio mayor a cero. | `commerce.dashboard.negotiations.descriptionNoMonths` |

### Proyectos (4)

| Texto | Clave |
|---|---|
| Nuevo formulario | `projects.requirements.documentList.newForm` |
| Agregar formularios | `projects.requirements.documentList.addForms` |
| Eliminar pregunta | `projects.forms.question.deleteQuestion` |
| Eliminar opción | `projects.forms.question.deleteOption` |

### Precintos (4)

| Texto | Clave |
|---|---|
| Precinto, código, rango numérico... | `seals.view.searchPlaceholder` |
| Si seleccionas “Otro”, debes escribir una observación | `seals.voidModal.otherNeedsObservation` |
| Solo números · los precintos con código (ej. CLIS_3676) se asignan en “Individual / códigos” | `seals.assignModal.rangeHint` |
| El prefijo (letras o guiones) debe ser igual en el “Desde” y el “Hasta”. | `seals.receiveModal.prefixMismatch` |

### Componentes compartidos (3)

| Texto | Clave |
|---|---|
| PDF, Word, PNG, XLS, MSG, EML (Tamaño máx. 30 MB) | `components.documentButton.allowedFiles` |
| Solo puedes subir archivos JPG o PNG. | `components.uploadImg.invalidType` |
| La imagen debe pesar menos de 2 MB. | `components.uploadImg.tooLarge` |

### Menú y sesión (3)

| Texto | Clave |
|---|---|
| Abrir menú | `shell.nav.openMenu` |
| Cambiamos el idioma en este equipo, pero no pudimos guardarlo en tu usuario. Intenta de nuevo más tarde. | `shell.userMenu.languageSaveError` |
| Imagen del proyecto | `shell.projectSelector.projectImage` |

### Proveedores (3)

| Texto | Clave |
|---|---|
| Buscar proveedores | `suppliers.list.searchSuppliers` |
| Descargar documento | `suppliers.audit.downloadDocument` |
| PDF, Word, PNG. (Tamaño máx. 30 MB) | `suppliers.drawer.fileHint` |

### Torre de recaudo (2)

| Texto | Clave |
|---|---|
| Canales frente a su meta | `collections.groupings.channel.title` |
| Coordinadores frente a su meta | `collections.groupings.coordinator.title` |

### Comunicaciones masivas (2)

| Texto | Clave |
|---|---|
| COL-001, COL-002, MEX-001 o uno por línea: COL-001 COL-002 MEX-001 | `massCommunications.recipients.placeholder` |
| 10:30 a. m. | `massCommunications.whatsappPreview.sampleTime` |

### Dashboard (2)

| Texto | Clave |
|---|---|
| No se pudieron cargar los recursos del mapa. | `newDashboard.map.loadError` |
| No se pudo iniciar el mapa. | `newDashboard.map.initError` |

### Tareas (2)

| Texto | Clave |
|---|---|
| ¿Cómo se resolvió? (opcional) | `tickets.detail.howResolved` |
| ¿Por qué se cancela? (opcional) | `tickets.detail.whyCanceled` |

### Cuentas médicas (1)

| Texto | Clave |
|---|---|
| No se pudieron descargar los documentos. | `medicalAccounts.documents.downloadError` |

### Portales públicos (1)

| Texto | Clave |
|---|---|
| No se proporcionó el token del archivo | `publicPortals.filePortal.missingToken` |

### Órdenes de compra (1)

| Texto | Clave |
|---|---|
| El documento no es válido o está dañado | `purchaseOrders.document.errors.invalid` |

### Conciliación (1)

| Texto | Clave |
|---|---|
| Procesando la cartera… | `reconciliation.uploadStatus.processingPortfolio` |

### Mail (1)

| Texto | Clave |
|---|---|
| No se pudieron cargar los detalles de la tarea | `taskManager.detail.loadError` |

### Cartera por edad (1)

| Texto | Clave |
|---|---|
| Total filtrado | `wallet.invoicesTable.filteredTotal` |

## Solo tildes o mayúsculas

### Tablas, selectores y servicios (56)

| Texto | Clave |
|---|---|
| Seleccione tipo de cliente | `shared.selects.selectCustomerType` |
| Agregar holding | `shared.selects.addHolding` |
| - Sin asignar - | `shared.selects.unassignedOption` |
| Seleccione un holding | `shared.selects.selectHolding` |
| Seleccione tipo de documento | `shared.selects.selectDocumentType` |
| Agregar canal | `shared.selects.addChannel` |
| Sin sublíneas actualmente. | `shared.selects.noSublines` |
| Sin líneas actualmente. | `shared.selects.noLines` |
| Nombre grupo | `shared.tables.clientsGroups.columns.groupName` |
| Crear grupo de clientes | `shared.tables.clientsGroups.create` |
| Vía | `shared.tables.communications.columns.via` |
| Ver saldos | `shared.tables.invoices.viewDeductions` |
| Nuevo proyecto | `shared.tables.projects.newProject` |
| La invitación fue enviada nuevamente. | `shared.tables.users.invitationResent` |
| Nuevo usuario | `shared.tables.users.newUser` |
| Carga masiva Ship To | `shared.tables.clients.bulkUploadShipTo` |
| Descarga plantilla Ship To | `shared.tables.clients.downloadShipToTemplate` |
| Ver proyectos | `shared.projectForm.viewProjects` |
| Nombre del proyecto | `shared.projectForm.projectName` |
| País es obligatorio * | `shared.projectForm.countryRequired` |
| El período de facturación es obligatorio * | `shared.projectForm.billingPeriodRequired` |
| DSO - Cálculo solo del año actual | `shared.projectForm.dsoCurrentYearOnly` |
| Sí | No | `shared.projectForm.yesNoPlaceholder` |
| Información de contacto | `shared.projectForm.contactInfo` |
| Personalizar proyecto | `shared.projectForm.customizeProject` |
| Color personalizado | `shared.projectForm.customColor` |
| Color personalizado es obligatorio * | `shared.projectForm.customColorRequired` |
| Ver usuarios | `shared.userForm.viewUsers` |
| Editar usuario | `shared.userForm.editUser` |
| Reglas de proyecto | `shared.userForm.projectRules` |
| La zona es obligatoria * | `shared.userForm.zoneRequired` |
| Las reglas de negocio son obligatorias * | `shared.userForm.businessRulesRequired` |
| Solicitud de descuento | `shared.constants.approvalTypes.discountRequest` |
| Compra de material | `shared.constants.approvalTypes.materialPurchase` |
| Bonificación negociación del cliente | `shared.constants.approvalTypes.freeGoodsNegotiation` |
| Ver clientes | `shared.clientForm.viewCustomers` |
| Razón social | `shared.clientForm.legalName` |
| Cargar documentos | `shared.clientForm.uploadDocuments` |
| Tipo de envío | `shared.communicationForm.sendType` |
| Seleccione al menos 1 tipo de envío * | `shared.communicationForm.sendTypeRequired` |
| Vía | `shared.communicationForm.via` |
| Seleccionar vía | `shared.communicationForm.selectVia` |
| Las reglas de negocio son obligatorias * | `shared.communicationForm.businessRulesRequired` |
| Error creando cliente | `shared.services.createCustomerError` |
| Error actualizando cliente | `shared.services.updateCustomerError` |
| Error al eliminar órdenes | `shared.services.ordersDeleteError` |
| La línea fue creada exitosamente. | `shared.services.lineCreated` |
| La sublínea fue creada exitosamente. | `shared.services.sublineCreated` |
| La línea fue eliminada exitosamente. | `shared.services.lineDeleted` |
| La sublínea fue eliminada exitosamente. | `shared.services.sublineDeleted` |
| El cliente fue creado exitosamente. | `shared.services.customerCreated` |
| El cliente fue actualizado exitosamente. | `shared.services.customerUpdated` |
| El cliente fue eliminado exitosamente. | `shared.services.customerDeleted` |
| Tipo de documento creado exitosamente. | `shared.services.documentTypeCreated` |
| Tipo de documento eliminado exitosamente. | `shared.services.documentTypeDeleted` |
| Dirección creada exitosamente. | `shared.services.addressCreated` |

### Data Quality (13)

| Texto | Clave |
|---|---|
| El código debe tener al menos 1 carácter | `dataQuality.materialForm.validation.codeMin` |
| La descripción debe tener al menos 1 carácter | `dataQuality.materialForm.validation.descriptionMin` |
| No se pudo recibir ningún archivo. Revisa la conexión e intenta de nuevo. | `dataQuality.auxiliaryUpload.noneReceivedMessage` |
| Arrastra tus archivos aquí | `dataQuality.auxiliaryUpload.dropTitle` |
| No se pudo recibir ningún archivo | `dataQuality.auxiliaryUpload.noneReceivedTitle` |
| Revisa la conexión e intenta de nuevo. No quedó ningún lote registrado. | `dataQuality.auxiliaryUpload.noneReceivedDescription` |
| El cargue quedó incompleto | `dataQuality.auxiliaryUpload.incompleteUploadTitle` |
| El lote terminó con errores | `dataQuality.auxiliaryUpload.batchErrorsTitle` |
| El lote no se completó | `dataQuality.auxiliaryUpload.batchIncompleteTitle` |
| No se entregó ningún archivo. Vuelve a cargar el auxiliar completo. | `dataQuality.auxiliaryUpload.batchIncompleteDescription` |
| País / Cliente / Archivo | `dataQuality.dashboard.ingestion.columns.hierarchy` |
| Error de transformación | `dataQuality.dashboard.ingestion.issueType.transformationError` |
| Transformación | `dataQuality.dashboard.ingestion.stage.Transformacion` |

### Cartera (clientes) (12)

| Texto | Clave |
|---|---|
| Aplicar filtros | `clients.home.filters.apply` |
| No se pudo obtener el Excel log | `clients.applyTab.messages.excelLogUnavailable` |
| Error al descargar el Excel log | `clients.applyTab.messages.downloadExcelLogError` |
| Pegar desde Excel | `clients.applyTab.addToTablesModal.pasteFromExcel` |
| Descargar log IA | `clients.applyTab.generateActionModal.downloadAILog` |
| Pegar desde Excel | `clients.applyModals.shared.pasteFromExcel` |
| Ingresar motivo | `clients.applyModals.createAdjustment.reasonPlaceholder` |
| Gráfica | `clients.dashboard.graphAlt` |
| Pend. aplicación | `clients.dashboard.collectApply.pendingApplication` |
| Nuevo contacto | `clients.contacts.newContact` |
| Condiciones específicas | `clients.adjustments.item.specialConditions` |
| Factura asociada | `clients.balanceSettlement.columns.linkedInvoice` |

### Ventanas emergentes (11)

| Texto | Clave |
|---|---|
| Nuevo grupo de clientes | `modals.clientsGroup.newTitle` |
| Crear grupo | `modals.clientsGroup.create` |
| Usuario desconocido | `modals.noveltyDetail.events.unknownUser` |
| valor inválido | `modals.periodicity.invalidValue` |
| Eliminar canal | `modals.removeChannel.ok` |
| Eliminar línea | `modals.removeLine.ok` |
| Eliminar sublínea | `modals.removeSubline.ok` |
| Error al enviar link | `modals.sendExternalLink.sendError` |
| Error inesperado al enviar link | `modals.sendExternalLink.unexpectedError` |
| El periodo de facturación es obligatorio * | `modals.shipTo.billingRequired` |
| Cargar documentos | `modals.uploadDocument.titleUpload` |

### Órdenes de compra (11)

| Texto | Clave |
|---|---|
| Documento original | `purchaseOrders.document.title` |
| Algunos productos tienen stock | `purchaseOrders.backorderModal.someInStock` |
| Facturar orden de compra | `purchaseOrders.invoiceModal.title` |
| Crear orden de compra | `purchaseOrders.create.submit` |
| Cargar orden de compra | `purchaseOrders.list.uploadPurchaseOrder` |
| Cargar orden de compra | `purchaseOrders.uploadModal.title` |
| Escanear documento | `purchaseOrders.uploadModal.scanDocument` |
| Archivos cargados | `purchaseOrders.uploadModal.uploadedFiles` |
| Eliminar órdenes seleccionadas | `purchaseOrders.actionsModal.deleteSelected` |
| ID interno OC | `purchaseOrders.info.internalPoId` |
| Información de entrega | `purchaseOrders.info.deliveryInfo` |

### Comunicaciones masivas (10)

| Texto | Clave |
|---|---|
| Canal de comunicación | `massCommunications.channel.title` |
| Correo electrónico con adjuntos | `massCommunications.channel.descriptions.email` |
| El contenido del mensaje aparecerá aquí... | `massCommunications.message.bodyPlaceholder` |
| Escribe el contenido del correo usando tags dinámicos. La vista previa se actualiza en tiempo real. | `massCommunications.createTemplate.subtitle` |
| El contenido aparecerá aquí... | `massCommunications.createTemplate.contentPlaceholder` |
| Probar comunicación | `massCommunications.testCommunication.title` |
| Envía una comunicación de prueba a tu correo para verificar que todo se vea correctamente. | `massCommunications.testCommunication.description` |
| Eliminar del envío | `massCommunications.table.removeFromSend` |
| Confirmo que he revisado el contenido y los destinatarios. Esta acción no se puede deshacer. | `massCommunications.table.confirm` |
| Enviar comunicación | `massCommunications.table.send` |

### Componentes compartidos (7)

| Texto | Clave |
|---|---|
| Agregar sublínea | `components.channelBR.addSubline` |
| física | `components.filters.radicationTypes.physical` |
| física y web | `components.filters.radicationTypes.physicalAndWeb` |
| Marca de agua | `components.uploadImg.watermarkAlt` |
| Ingresar nombre de la línea | `components.inputCreate.linePlaceholder` |
| Ingresar nombre de la sublínea | `components.inputCreate.sublinePlaceholder` |
| Aplicar filtros | `components.filterModal.apply` |

### Descuentos (5)

| Texto | Clave |
|---|---|
| Mínimo de marcas | `discounts.byOrder.labels.minBrands` |
| Mínimo de unidades por marca | `discounts.byOrder.labels.minUnitsPerBrand` |
| Mínimo de SKU | `discounts.byOrder.labels.minSkus` |
| Tipo de dato inválido | `discounts.validation.invalidType` |
| La línea es requerida | `discounts.validation.lineRequired` |

### WhatsApp (4)

| Texto | Clave |
|---|---|
| Marcar como no leído | `chat.allChats.markUnread` |
| Link generado exitosamente | `chat.paymentLink.successTitle` |
| Enviar WhatsApp | `chat.selectClient.sendWhatsapp` |
| Selecciona un chat para ver la conversación | `chat.view.selectChat` |

### Aprobaciones (3)

| Texto | Clave |
|---|---|
| Tipo de aprobación | `approvals.table.columns.approvalType` |
| Días pendientes | `approvals.table.columns.daysPending` |
| Confirmar rechazo | `approvals.detail.confirmReject` |

### Precintos (2)

| Texto | Clave |
|---|---|
| Agrupar: Unidad | `seals.view.groupByUnit` |
| Aplicar filtros | `seals.filters.apply` |

### Proveedores (2)

| Texto | Clave |
|---|---|
| Eliminar documento | `suppliers.drawer.deleteDocument` |
| Usuario desconocido | `suppliers.events.unknownUser` |

### Bancos (1)

| Texto | Clave |
|---|---|
| Ingresa descripción y nombre del cliente | `banks.rules.modal.description` |

### Marketplace (1)

| Texto | Clave |
|---|---|
| Órdenes sin stock | `commerce.generateAction.ordersWithoutStock` |

### Textos comunes (1)

| Texto | Clave |
|---|---|
| N/D | `common.status.notAvailable` |

### Configuración del Marketplace (1)

| Texto | Clave |
|---|---|
| Comunicaciones Masivas | `marketAdmin.home.sections.massCommunications.label` |

### Logística inversa (1)

| Texto | Clave |
|---|---|
| autorizado por el lab vía correo | `reverseLogistics.detail.observationFallback` |

### Cartera por edad (1)

| Texto | Clave |
|---|---|
| Descargar a Excel | `wallet.actionsMenu.downloadExcel` |

