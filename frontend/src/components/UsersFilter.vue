<!-- frontend/src/components/UsersFilter.vue -->
<template>
  <section class="section card">
    <!-- Fila principal -->
    <div class="grid gap-3 md:grid-cols-12">
      <div class="md:col-span-5">
        <label class="field">
          <span>Buscar</span>
          <input
            :value="model.q"
            @input="update('q', $event.target.value)"
            @keyup.enter.prevent="$emit('change')"
            placeholder="Nombre, usuario o email…"
            type="text"
            />
            

        </label>
      </div>

      <div class="md:col-span-3">
        <label class="field">
          <span>Rol</span>
          <select
            :value="model.role"
            @change="update('role', $event.target.value)"
          >
            <option value="">Todos</option>
            <option value="regular">Regular</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      <div class="md:col-span-4">
        <label class="field">
          <span>Estado</span>
          <select
            :value="model.status"
            @change="update('status', $event.target.value)"
          >
            <option value="active">Activos</option>
            <option value="deleted">Eliminados</option>
            <option value="all">Todos</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Filtros avanzados -->
    <details class="mt-3">
      <summary class="cursor-pointer muted">Filtros avanzados</summary>
      <div class="grid gap-3 mt-3 md:grid-cols-12">
        <div class="md:col-span-3">
          <label class="field">
            <span>Desde</span>
            <input type="date" :value="model.from" @input="update('from', $event.target.value)" />
          </label>
        </div>
        <div class="md:col-span-3">
          <label class="field">
            <span>Hasta</span>
            <input type="date" :value="model.to" @input="update('to', $event.target.value)" />
          </label>
        </div>
        <div class="md:col-span-3">
          <label class="field">
            <span>Ordenar por</span>
            <select :value="model.sortBy" @change="update('sortBy', $event.target.value)">
              <option value="createdAt">Creado</option>
              <option value="username">Usuario</option>
              <option value="email">Email</option>
              <option value="role">Rol</option>
            </select>
          </label>
        </div>
        <div class="md:col-span-3">
          <label class="field">
            <span>Dirección</span>
            <select :value="model.sortDir" @change="update('sortDir', $event.target.value)">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </label>
        </div>
        <div class="md:col-span-3">
          <label class="field">
            <span>Por página</span>
            <select :value="model.limit" @change="update('limit', Number($event.target.value))">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    </details>

    <!-- Acciones -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button class="btn" @click="clear">Limpiar</button>
      <button class="btn btn--primary" @click="$emit('change')">Aplicar</button>
    </div>

    <!-- Chips resumen -->
    <div class="mt-3 flex flex-wrap gap-2 text-xs">
      <span v-if="model.q" class="badge">“{{ model.q }}”</span>
      <span v-if="model.role" class="badge">Rol: {{ model.role }}</span>
      <span v-if="model.status !== 'active'" class="badge">Estado: {{ model.status }}</span>
      <span v-if="model.from" class="badge">Desde: {{ model.from }}</span>
      <span v-if="model.to" class="badge">Hasta: {{ model.to }}</span>
      <span class="badge">Orden: {{ model.sortBy }} {{ model.sortDir }}</span>
      <span class="badge">Límite: {{ model.limit }}</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
});
const emit = defineEmits(['update:modelValue', 'change']);

const model = computed(() => props.modelValue);

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
}

function clear() {
  emit('update:modelValue', {
    q: '',
    role: '',
    status: 'active',
    from: '',
    to: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
    limit: 10,
  });
  emit('change');
}
</script>
