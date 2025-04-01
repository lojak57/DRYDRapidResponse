<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import type { Quote, QuoteLineItem } from '$lib/types/Quote';
  import { getQuoteById } from '$lib/services/quotes';
  import { nanoid } from 'nanoid';
  
  export let job: Job;
  
  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    submit: { 
      laborCost: number;
      materialsCost: number;
      equipmentCost: number;
      lineItems: CustomLineItem[];
      finalNotes: string;
      totalJobCost: number;
    };
    cancel: void;
  }>();
  
  // Define custom line item type
  interface CustomLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    category: string;
  }
  
  // Form state
  let laborCost = 0;
  let materialsCost = 0; 
  let equipmentCost = 0;
  let finalNotes = '';
  let lineItems: CustomLineItem[] = [];
  let quoteLineItems: QuoteLineItem[] = [];
  let selectedQuoteItems: QuoteLineItem[] = [];
  let isLoadingQuote = false;
  let quoteError = '';
  let quote: Quote | null = null;
  
  // New line item state
  let newItem: CustomLineItem = createEmptyLineItem();
  
  function createEmptyLineItem(): CustomLineItem {
    return {
      id: nanoid(6),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      category: 'MISC'
    };
  }
  
  // Calculate total cost
  $: {
    // Update new item total when quantity or price changes
    newItem.total = newItem.quantity * newItem.unitPrice;
  }
  
  $: lineItemsTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  $: totalJobCost = laborCost + materialsCost + equipmentCost + lineItemsTotal;
  
  // Load quote data if this job was created from a quote
  onMount(async () => {
    if (job.originatingQuoteId) {
      await loadQuoteData(job.originatingQuoteId);
    }
  });
  
  async function loadQuoteData(quoteId: string) {
    isLoadingQuote = true;
    quoteError = '';
    
    try {
      quote = await getQuoteById(quoteId);
      if (quote) {
        quoteLineItems = quote.lineItems;
        
        // Pre-populate values from quote
        if (quote.lineItems && quote.lineItems.length > 0) {
          // Pre-populate material and labor costs
          const laborItems = quote.lineItems.filter(item => 
            item.category === 'LABOR' || 
            item.description.toLowerCase().includes('labor'));
          
          const materialItems = quote.lineItems.filter(item => 
            item.category === 'MATERIALS' || 
            item.description.toLowerCase().includes('material'));
          
          const equipmentItems = quote.lineItems.filter(item => 
            item.category === 'EQUIPMENT' || 
            item.description.toLowerCase().includes('equipment'));
          
          if (laborItems.length > 0) {
            laborCost = laborItems.reduce((sum, item) => sum + item.total, 0);
          }
          
          if (materialItems.length > 0) {
            materialsCost = materialItems.reduce((sum, item) => sum + item.total, 0);
          }
          
          if (equipmentItems.length > 0) {
            equipmentCost = equipmentItems.reduce((sum, item) => sum + item.total, 0);
          }
        }
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      quoteError = 'Failed to load quote data';
    } finally {
      isLoadingQuote = false;
    }
  }
  
  function addLineItem() {
    if (newItem.description && newItem.unitPrice > 0) {
      lineItems = [...lineItems, { ...newItem }];
      newItem = createEmptyLineItem();
    }
  }
  
  function removeLineItem(id: string) {
    lineItems = lineItems.filter(item => item.id !== id);
  }
  
  function addSelectedQuoteItems() {
    if (selectedQuoteItems.length === 0) return;
    
    // Convert quote items to custom line items
    const newCustomItems = selectedQuoteItems.map(quoteItem => ({
      id: nanoid(6),
      description: quoteItem.description,
      quantity: quoteItem.quantity,
      unitPrice: quoteItem.unitPrice,
      total: quoteItem.total,
      category: quoteItem.category || 'MISC'
    }));
    
    lineItems = [...lineItems, ...newCustomItems];
    selectedQuoteItems = [];
  }
  
  // Handle form submission
  function handleSubmit() {
    dispatch('submit', {
      laborCost,
      materialsCost,
      equipmentCost,
      lineItems,
      finalNotes,
      totalJobCost
    });
  }
  
  // Handle cancel
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-3">Job Cost Summary</h3>
    <p class="text-gray-500 mb-4">Please review and finalize the job costs. This information will be used for invoicing.</p>
    
    <!-- Quote Information (if available) -->
    {#if job.originatingQuoteId}
      <div class="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
        {#if isLoadingQuote}
          <p class="text-sm text-blue-700">Loading quote information...</p>
        {:else if quoteError}
          <p class="text-sm text-red-600">{quoteError}</p>
        {:else if quote}
          <div class="mb-2">
            <h4 class="text-sm font-medium text-blue-800">Quote Information</h4>
            <p class="text-xs text-blue-600">Quote #{quote.quoteNumber} (Total: ${quote.total.toFixed(2)})</p>
          </div>
          
          {#if quoteLineItems.length > 0}
            <div class="mt-3">
              <h5 class="text-sm font-medium text-blue-800 mb-2">Import Line Items from Quote</h5>
              <div class="max-h-60 overflow-y-auto bg-white rounded border border-blue-200 p-2">
                {#each quoteLineItems as item (item.id)}
                  <div class="flex items-center space-x-2 py-1 border-b border-blue-100 last:border-0">
                    <input 
                      type="checkbox" 
                      id="quote-item-{item.id}" 
                      bind:group={selectedQuoteItems} 
                      value={item}
                      class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label for="quote-item-{item.id}" class="text-xs flex-1">
                      {item.description} ({item.quantity} × ${item.unitPrice.toFixed(2)})
                    </label>
                    <span class="text-xs font-medium">${item.total.toFixed(2)}</span>
                  </div>
                {/each}
              </div>
              <button 
                type="button"
                class="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                on:click={addSelectedQuoteItems}
                disabled={selectedQuoteItems.length === 0}
              >
                Add Selected Items
              </button>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
    
    <div class="space-y-4">
      <!-- Labor Cost -->
      <div>
        <label for="laborCost" class="block text-sm font-medium text-gray-700">Labor Cost ($)</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            id="laborCost"
            bind:value={laborCost}
            class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          />
        </div>
      </div>
      
      <!-- Materials Cost -->
      <div>
        <label for="materialsCost" class="block text-sm font-medium text-gray-700">Materials Cost ($)</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            id="materialsCost"
            bind:value={materialsCost}
            class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          />
        </div>
      </div>
      
      <!-- Equipment Cost -->
      <div>
        <label for="equipmentCost" class="block text-sm font-medium text-gray-700">Equipment Cost ($)</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            id="equipmentCost"
            bind:value={equipmentCost}
            class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          />
        </div>
      </div>
      
      <!-- Additional Line Items Section -->
      <div class="mt-6">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Additional Line Items</h4>
        
        <!-- List of current line items -->
        {#if lineItems.length > 0}
          <div class="mb-4 border rounded-md overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each lineItems as item (item.id)}
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                    <td class="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                    <td class="px-4 py-2 text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900 text-right">${item.total.toFixed(2)}</td>
                    <td class="px-4 py-2 text-right">
                      <button 
                        type="button" 
                        class="text-red-600 hover:text-red-800" 
                        on:click={() => removeLineItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                {/each}
                <tr class="bg-gray-50">
                  <td colspan="3" class="px-4 py-2 text-sm font-medium text-gray-900 text-right">Subtotal</td>
                  <td class="px-4 py-2 text-sm font-medium text-gray-900 text-right">${lineItemsTotal.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        {/if}
        
        <!-- Add new line item form -->
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h5 class="text-sm font-medium text-gray-700 mb-3">Add New Line Item</h5>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label for="newItemDescription" class="block text-xs font-medium text-gray-700">Description</label>
              <input
                type="text"
                id="newItemDescription"
                bind:value={newItem.description}
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-md"
                placeholder="Description of the item or service"
              />
            </div>
            <div>
              <label for="newItemCategory" class="block text-xs font-medium text-gray-700">Category</label>
              <select
                id="newItemCategory"
                bind:value={newItem.category}
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-md"
              >
                <option value="MISC">Miscellaneous</option>
                <option value="LABOR">Labor</option>
                <option value="MATERIALS">Materials</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="SUBCONTRACTOR">Subcontractor</option>
                <option value="FEE">Fee</option>
              </select>
            </div>
            <div>
              <label for="newItemQuantity" class="block text-xs font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min="1"
                id="newItemQuantity"
                bind:value={newItem.quantity}
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-md"
                placeholder="1"
              />
            </div>
            <div>
              <label for="newItemUnitPrice" class="block text-xs font-medium text-gray-700">Unit Price ($)</label>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-xs">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  id="newItemUnitPrice"
                  bind:value={newItem.unitPrice}
                  class="pl-5 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div class="flex items-end">
              <button
                type="button"
                class="py-1.5 px-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                on:click={addLineItem}
                disabled={!newItem.description || newItem.unitPrice <= 0}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Final Notes -->
      <div>
        <label for="finalNotes" class="block text-sm font-medium text-gray-700">Final Notes</label>
        <div class="mt-1">
          <textarea
            id="finalNotes"
            rows="3"
            bind:value={finalNotes}
            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter any final notes about the job"
          ></textarea>
        </div>
      </div>
      
      <!-- Total Job Cost Summary -->
      <div class="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
        <div class="flex justify-between items-center">
          <h4 class="text-base font-medium text-gray-900">Total Job Cost:</h4>
          <span class="text-lg font-semibold text-blue-600">${totalJobCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="pt-5 border-t border-gray-200 mt-8 flex justify-end space-x-3">
    <button
      type="button"
      on:click={handleCancel}
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      Cancel
    </button>
    
    <button
      type="submit"
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Finalize Job
    </button>
  </div>
</form> 