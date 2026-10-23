const mutationMethods = new Set(['post', 'put', 'patch', 'delete']);

type ActionTrigger = HTMLButtonElement | HTMLInputElement;
type InertiaVisit = { id?: string; method?: string };

let initialized = false;
let mutationInProgress = false;
let latestTrigger: ActionTrigger | null = null;
let activeTrigger: ActionTrigger | null = null;
let activeVisit: InertiaVisit | null = null;
let triggerWasDisabled = false;

function rememberTrigger(target: EventTarget | null) {
    const element = target instanceof Element ? target : null;
    const trigger = element?.closest('button, input[type="submit"]');

    latestTrigger =
        trigger instanceof HTMLButtonElement || trigger instanceof HTMLInputElement
            ? trigger
            : null;
}

function setLoadingState(trigger: ActionTrigger, isLoading: boolean) {
    trigger.disabled = isLoading || triggerWasDisabled;
    trigger.toggleAttribute('aria-busy', isLoading);
    trigger.classList.toggle('is-action-loading', isLoading);
}

function releaseActionLock() {
    mutationInProgress = false;
    activeVisit = null;

    if (activeTrigger?.isConnected) setLoadingState(activeTrigger, false);

    activeTrigger = null;
    latestTrigger = null;
    triggerWasDisabled = false;
}

/**
 * Evita envíos duplicados en peticiones de creación, actualización y borrado.
 * Usa los eventos públicos de Inertia y no modifica internamente el router.
 */
export function initializeActionLock() {
    if (initialized || typeof document === 'undefined') return;

    initialized = true;

    document.addEventListener(
        'click',
        (event) => rememberTrigger(event.target),
        true,
    );
    document.addEventListener(
        'submit',
        (event) => rememberTrigger(event.submitter),
        true,
    );

    document.addEventListener('inertia:before', (event) => {
        const visit = (event as CustomEvent<{ visit: InertiaVisit }>).detail
            .visit;
        const method = (visit.method ?? 'get').toLowerCase();

        if (!mutationMethods.has(method)) return;

        if (mutationInProgress) {
            event.preventDefault();
            return;
        }

        mutationInProgress = true;
        activeVisit = visit;
        activeTrigger = latestTrigger;
        triggerWasDisabled = activeTrigger?.disabled ?? false;

        if (activeTrigger) setLoadingState(activeTrigger, true);
    });

    document.addEventListener('inertia:finish', (event) => {
        const visit = (event as CustomEvent<{ visit: InertiaVisit }>).detail
            .visit;

        if (visit.id !== activeVisit?.id) return;

        releaseActionLock();
    });

    // Un 400 de Laravel (por ejemplo, un archivo inválido) no debe dejar el
    // formulario bloqueado aunque Inertia no pueda renderizar la respuesta.
    document.addEventListener('inertia:invalid', releaseActionLock);
    document.addEventListener('inertia:exception', releaseActionLock);
}
